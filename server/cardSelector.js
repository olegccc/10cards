import {ObjectId} from 'mongodb'
import _ from 'lodash';
import sha256 from 'js-sha256'

function idToStr(id) {
    if (!id) {
        return id;
    }
    if (id.toHexString) {
        id = id.toHexString();
    }
    return id.substring(id.length-2);
}

export default class CardSelector {

    constructor(db, set, session) {
        this.db = db;
        this.set = set;
        this.session = session;
        this.targets = [];
        this.simpleMode = this.set.simpleMode === undefined || this.set.simpleMode;
    }

    static generateAnswerId() {
        return sha256(ObjectId().toHexString()).substring(0, 20);
    }

    async loadCards() {
        this.cards = await this.db.collection('cards').find({
            setId: this.set._id
        }).toArray();
    }

    async getHardestCardIds() {
        this.simpleMode = true;
        await this.loadCards();
        await this.getAnswers();
        this.prepareAnswers();
        return this.cards.map(card => card._id);
    }

    async getAnswers() {

        let answersQuery = [
            {
                $match: {setId: this.set._id}
            },
            {
                $sort: {'created': -1}
            },
            {
                $group: {
                    _id: '$cardId',
                    count: {'$sum': 1},
                    items: {
                        $push: '$isCorrect'
                    }
                }
            },
            {
                // get last 5 answers for each card
                $project: {items: {$slice: ['$items', -5]}}
            }
        ];

        this.answers = await this.db.collection('answers').aggregate(answersQuery).toArray();

        if (!this.simpleMode) {
            this.cycleAnswers = await this.db.collection('cycleAnswers').find({
                setId: this.set._id
            }).toArray();
        }
    }

    async getLastAnswers() {

        let answers = await this.db.collection('answers').aggregate([
            { $match: {setId: this.set._id} },
            { $sort: {'created': -1} },
            { $limit: 3 },
            { $project: { cardId: 1 } }
        ]).toArray();

        this.lastAnswers = answers ? answers.map(r => r.cardId.toHexString()) : [];
        console.log('last answers:', this.lastAnswers.map(r => idToStr(r)));
    }

    prepareAnswers() {

        for (let answer of this.answers) {

            let card = this.cards.find(r => r._id.equals(answer._id));
            if (!card) {
                //console.log('Cannot find record ' + answer._id);
                continue;
            }

            card.answers = answer.count;

            if (answer.items.length) {
                let items = answer.items.map(i => i ? 1 : 0);
                card.score = items.reduce((a, b) => a + b, 0) / items.length;
            }
        }

        for (let card of this.cards) {
            card.score = card.score !== undefined ? card.score : -1;
        }

        // we place records which will have higher probability at the beginning of the list
        // * records without answers will have highest probability among others
        // * records with lower score will have higher probability than records with higher score
        // this way we guarantee to take all unanswered records as fast as possible and then concentrate on records
        // with lower score (i.e. which have less correct answers)

        this.cards.sort((a, b) => a.score - b.score);

        if (!this.simpleMode) {
            for (let answer of this.cycleAnswers) {
                let card = this.cards.find(r => r._id.equals(answer.cardId));
                if (card) {
                    card.answered = true;
                    card.correctAnswer = answer.isCorrect;
                }
            }
        }

        console.log('prepared cards: ', this.cards.map(card => ({
            score: card.score,
            source: card.source,
            id: idToStr(card._id)
        })));

        this.allCards = this.cards;
    }

    chooseRecord() {

        let index = Math.random();

        if (this.cards[0].score === -1) { // i.e. it was never chosen
            console.log('has unanswered cards');
            index = 0;
        } else if (!this.simpleMode) {
            index = Math.floor(index * this.cards.length);
        } else {
            // nonlinear probability distribution to take first items more often
            // note that [0;1) * [0;1) also belongs to [0;1)
            index = Math.floor(index * index * this.cards.length);
        }

        // console.log('2 ' + index + ' ' + cards.length);

        // choose a record
        let record = this.cards[index];

        // chose range of records with the same score
        let start = index, end = index+1;

        while (start > 0 && this.cards[start-1].score === record.score) {
            start--;
        }

        while (end < this.cards.length && this.cards[end].score === record.score) {
            end++;
        }

        if (end-start > 1) {
            console.log('cards with the same score: ', end-start);
            // if we have more than one record with the same score we choose randomly from the list of items with the same score
            index = start + Math.floor(Math.random()*(end-start));
            record = this.cards[index];
            //console.log('2.1: ' + (end-start) + ' ' + index);
        }

        if (!this.simpleMode) {
            return record;
        }

        // console.log('3', record);

        if (this.allCards.length < 6) { // exception: we don't check for last cards if we have very limited set of existing cards
            console.log('too less cards');
            return record;
        }

        // ensure it is not the same answer we got last three times

        let cardId = record._id.toHexString();
        let i;
        //console.log('cardId: ' + cardId + ', count: ' + lastAnswersCount + ', lastAnswers: ', this.lastAnswers);
        for (i = 0; i < this.lastAnswers.length; i++) {
            if (this.lastAnswers[i] === cardId) {
                break;
            }
        }

        if (i >= this.lastAnswers.length) {
            return record;
        }
    }

    prepareTargets(record) {

        if (record.answers && record.answers.length) {
            this.direction = true;

            this.targets = [];

            let answers = record.answers.map(a => a);

            while (answers.length > 0) {
                let index = Math.random();
                index = Math.floor(index * answers.length);

                this.targets.push({
                    text: answers[index],
                    id: CardSelector.generateAnswerId(),
                    comment: ''
                });
                answers.splice(index, 1);
            }
        } else {
            this.direction = Math.random() < 0.5;

            let recordTarget = this.direction ? record.target : record.source;
            let recordTargetLength = recordTarget.length;

            // console.log('4 ' + setId + ' ' + typeof setId);

            // choose cards which are different from the selected but have text length similar to selected
            // sort them by text length difference - less different placed on top
            let allTargets = this.allCards
                .filter(r => !r._id.equals(record._id))
                .map(r => ({
                    text: this.direction ? r.target : r.source,
                    comment: this.direction ? r.targetComment : r.sourceComment,
                    id: r.answerId }))
                .sort((a, b) => (Math.abs(a.text.length-recordTargetLength)-Math.abs(b.text.length-recordTargetLength)));

            //console.log(record.target);
            //console.log(JSON.stringify(allTargets, null, ' '));

            // console.log('5 ' + allTargets.length);

            // choose 4 incorrect answers
            while (allTargets.length > 0 && this.targets.length < 4) {

                let index = Math.random();

                if (allTargets.length < 4) {
                    index = Math.floor(index * allTargets.length);
                } else {
                    index = Math.floor(index * index * allTargets.length/2);
                }

                this.targets.push(allTargets[index]);
                allTargets.splice(index, 1);
            }
        }

        // add also correct answer to random position
        this.targets.splice(Math.floor(Math.random()*this.targets.length+1), 0, {
            text: this.direction ? record.target : record.source,
            comment: this.direction ? record.targetComment : record.sourceComment,
            id: record.answerId
        });
    }

    async chooseBlockModeCards() {

        if (!this.set.blockSize) {

            // filter out already answered cards
            let unansweredCards = this.cards.filter(card => !card.answered);

            if (!unansweredCards.length) {
                return {
                    allAnswered: true,
                    allCorrect: this.cards.filter(card => !card.correctAnswer).length === 0
                };
            }

            this.cards = unansweredCards;

            return null;
        }

        let currentBlock = this.set.currentBlock || {};

        console.log('currentBlock: ', _.map(currentBlock, (value, key) => ({ id: idToStr(key), value })));

        let filter = card => currentBlock[card._id.toHexString()];

        let unansweredCards = this.cards.filter(filter);

        if (unansweredCards.length > 0) {
            this.cards = unansweredCards;
            console.log('current selected cards: ', this.cards.map(card => ({
                score: card.score,
                source: card.source,
                id: idToStr(card._id)
            })));
            return null;
        }

        unansweredCards = this.cards.filter(card => !card.answered);

        if (!unansweredCards.length) {
            console.log('no unaswered cards');
            return {
                allAnswered: true,
                allCorrect: this.cards.filter(card => !card.correctAnswer).length === 0
            };
        }

        let selectedCards = [];

        this.cards = unansweredCards;

        while (this.cards.length > 0 && selectedCards.length < this.set.blockSize) {
            let record = this.chooseRecord();
            if (!record) {
                continue;
            }
            console.log('chose record ' + idToStr(record._id));
            selectedCards.push(record);
            this.cards = this.cards.filter(r => r._id !== record._id);
        }

        this.cards = selectedCards;

        console.log('new selected cards: ', this.cards.map(card => ({
            score: card.score,
            source: card.source,
            id: idToStr(card._id)
        })));

        currentBlock = {};
        for (let card of this.cards) {
            currentBlock[card._id.toHexString()] = true;
        }

        this.set.currentBlock = currentBlock;

        await this.db.collection('sets').updateOne({
            _id: this.set._id
        }, {
            $set: {
                currentBlock: currentBlock
            }
        });

        return null;
    }

    async selectCard() {

        await this.loadCards();

        if (!this.cards.length) {
            return {
                noCards: true
            };
        }

        await this.getAnswers();

        if (this.simpleMode) {
            await this.getLastAnswers();
        }

        this.prepareAnswers();

        if (!this.simpleMode) {

            let ret = await this.chooseBlockModeCards();

            if (ret) {
                return ret;
            }
        }

        let record;

        for (;;) {
            record = this.chooseRecord();
            if (record) {
                break;
            }
        }

        console.log('chose record ' + idToStr(record._id));

        this.prepareTargets(record);

        let ret = {
            items: this.targets,
            source: this.direction ? record.source : record.target,
            comment: this.direction ? record.sourceComment : record.targetComment,
            id: record._id
        };

        if (!this.simpleMode) {
            let count = await this.db.collection('cycleAnswers').count({
                setId: this.set._id
            });
            ret.remainingTotal = this.allCards.length - count;
        }

        if (this.set.blockSize > 0) {
            ret.remainingBlock = 0;
            _.each(this.set.currentBlock, (value) => {
                if (value) {
                    ret.remainingBlock++;
                }
            });
        }

        return ret;
    }
}