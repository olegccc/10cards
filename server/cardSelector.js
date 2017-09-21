import {ObjectId} from 'mongodb'
import _ from 'lodash';

export default class CardSelector {

    constructor(db, set, session) {
        this.db = db;
        this.set = set;
        this.session = session;
        this.targets = [];
        this.direction = Math.random() < 0.5;
        this.simpleMode = this.set.simpleMode === undefined || this.set.simpleMode;
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
            { $project: { _id: 1 } }
        ]).toArray();

        this.lastAnswers = answers ? answers.map(r => r._id.toHexString()) : [];
    }

    prepareAnswers() {

        for (let answer of this.answers) {

            let card = this.cards.find(r => r._id.equals(answer._id));
            if (!card) {
                //console.log('Cannot find record ' + answer._id);
                continue;
            }

            card.answers = answer.count;

            if (this.simpleMode && answer.items.length) {
                let items = answer.items.map(i => i ? 1 : 0);
                card.score = items.reduce((a, b) => a + b, 0) / items.length;
            }
        }

        if (this.simpleMode) {

            for (let card of this.cards) {
                card.score = card.score !== undefined ? card.score : -1;
            }

            // we place records which will have higher probability at the beginning of the list
            // * records without answers will have highest probability among others
            // * records with lower score will have higher probability than records with higher score
            // this way we guarantee to take all unanswered records as fast as possible and then concentrate on records
            // with lower score (i.e. which have less correct answers)

            this.cards.sort((a, b) => a.score - b.score);

        } else {

            for (let answer of this.cycleAnswers) {
                let card = this.cards.find(r => r._id.equals(answer.cardId));
                if (card) {
                    card.answered = true;
                    card.correctAnswer = answer.isCorrect;
                }
            }
        }

        this.allCards = this.cards;
    }

    chooseRecord() {

        let index = Math.random();

        // nonlinear probability distribution to take first items more often
        // note that [0;1) * [0;1) also belongs to [0;1)
        index = Math.floor(index * index * this.cards.length);

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
            // if we have more than one record with the same score we choose randomly from the list of items with the same score
            index = start + Math.floor(Math.random()*(end-start));
            record = this.cards[index];
            //console.log('2.1: ' + (end-start) + ' ' + index);
        }

        // console.log('3', record);

        // ensure it is not the same answer we got last three times; assume that
        // lastAnswers is sorted as 'first item is the newest one'

        if (this.cards.length < 6) { // exception: we don't check for last cards if we have very limited set of existing cards
            //console.log('too less cards');
            return record;
        }

        if (!this.simpleMode) {
            return record;
        }

        let lastAnswersCount = Math.min(3, this.lastAnswers.length);
        let cardId = record._id.toHexString();
        let i;
        console.log('cardId: ' + cardId + ', count: ' + lastAnswersCount + ', lastAnswers: ', this.lastAnswers);
        for (i = 0; i < 3 && i < lastAnswersCount; i++) {
            if (this.lastAnswers[i] === cardId) {
                break;
            }
        }

        console.log(i);

        if (i >= lastAnswersCount) {
            return record;
        }
    }

    prepareTargets(record) {

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
            if (allTargets.length < 4) {
                this.targets.push(allTargets.pop());
                continue;
            }

            let index = Math.random();
            index = Math.floor(index * index * allTargets.length/2);

            this.targets.push(allTargets[index]);
            allTargets.splice(index, 1);
        }

        // add also correct answer to random position
        this.targets.splice(Math.floor(Math.random()*this.targets.length+1), 0, {
            text: this.direction ? record.target : record.source,
            comment: this.direction ? record.targetComment : record.sourceComment,
            id: record.answerId
        });
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

            } else {

                let hasIncorrect = false;

                let currentBlock = this.set.currentBlock || {};

                let hasChanges = false;

                let filter = card => {
                    let ref = currentBlock[card._id.toHexString()];
                    if (ref && !ref.correct) {
                        hasIncorrect = true;
                    }
                    return ref && !ref.answered;
                };

                let unansweredCards = this.cards.filter(filter);

                if (!unansweredCards.length && hasIncorrect) {
                    _.each(currentBlock, (value, key) => {
                        if (!value.correct) {
                            value.answered = false;
                            hasChanges = true;
                        }
                    });
                    unansweredCards = this.cards.filter(filter);
                }

                if (unansweredCards.length) {
                    this.cards = unansweredCards;
                } else {
                    unansweredCards = this.cards.filter(card => !card.answered);

                    if (!unansweredCards.length) {
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
                        selectedCards.push(record);
                        this.cards = unansweredCards.filter(r => r !== record);
                    }

                    this.cards = selectedCards;

                    currentBlock = {};
                    for (let card of this.cards) {
                        currentBlock[card._id.toHexString()] = {
                            answered: false,
                            correct: false
                        };
                    }

                    hasChanges = true;
                }

                if (hasChanges) {

                    this.set.currentBlock = currentBlock;

                    await this.db.collection('sets').updateOne({
                        _id: this.set._id
                    }, {
                        $set: {
                            currentBlock: currentBlock
                        }
                    });
                }
            }
        }

        // console.log(1);

        // console.log(JSON.stringify(cards.map(card => ({
        //     answers: card.answers,
        //     score: card.score,
        //     source: card.source
        // })), null, ' '));

        //console.log(answers);

        //console.log(records);

        let record;

        if (this.cards[0].score === -1) { // i.e. it was never chosen
            record = this.cards[0];
        } else {

            for (;;) {
                record = this.chooseRecord();
                if (record) {
                    break;
                }
            }
        }

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
                if (!value.answered) {
                    ret.remainingBlock++;
                }
            });
        }

        return ret;
    }
}