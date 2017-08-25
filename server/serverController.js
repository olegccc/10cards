import ServerUtils from './serverUtils'
import {connect, ObjectId} from 'mongodb'
import FetchService from '../shared/fetchService'
import sha256 from 'js-sha256'

const ALL_METHODS = [
    'post:card:getCard',
    'post:login',
    'post:select:selectCard',
    'post:sets:getSets',
    'post:addSet',
    'post:subsets:getSubsets',
    'post:addSubset',
    'post:addCard',
    'post:cards:getCards',
    'post:deleteCard'
];

const RE_OBJECT_ID = /^[0-9a-fA-F]{24}$/;

const mongoDbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/10cards';

function random(max) {
    return Math.floor(Math.random()*max);
}

export default class ServerController {

    constructor(server, deviceApi) {
        ServerUtils.bootstrap(this, server, ALL_METHODS);
    }

    async initialize() {
        this.db = await connect(mongoDbUrl);
    }

    async deleteCard(req) {

        let cardId = req.body.cardId;

        if (!cardId || !RE_OBJECT_ID.test(cardId)) {
            throw Error('Wrong card id');
        }

        cardId = ObjectId(cardId);

        let session = await this.getSession(req);

        let card = await this.db.collection('cards').findOne({
            _id: cardId
        });

        if (!card || card.userId !== session.userId) {
            throw Error('Cannot find card');
        }

        await this.db.collection('answers').removeMany({
            cardId
        });

        await this.db.collection('cards').removeOne({
            _id: cardId
        });

        return {
            success: true
        };
    }

    async addCard(req) {

        let session = await this.getSession(req);

        let {setId, subsetId, source, target, comment} = req.body;

        let subset = await this.db.collection('subsets').findOne({
            _id: ObjectId(subsetId)
        });

        if (!subset || subset.userId !== session.userId) {
            throw Error('Cannot find subset');
        }

        let result = await this.db.collection('cards').insertOne({
            userId: session.userId,
            created: new Date(),
            setId: ObjectId(setId),
            subsetId: ObjectId(subsetId),
            source,
            target,
            comment,
            answerId: sha256(ObjectId().toHexString()).substring(0, 20)
        });

        return {
            id: result.insertedId
        };
    }

    async addSet(req) {

        if (!req.body.name) {
            throw Error('Set name cannot be empty');
        }

        let session = await this.getSession(req);

        let result = await this.db.collection('sets').insertOne({
            userId: session.userId,
            created: new Date(),
            name: req.body.name
        });

        return {
            id: result.insertedId
        };
    }

    async getSets(req) {

        let session = await this.getSession(req);

        let sets = await this.db.collection('sets').find({
            userId: session.userId
        }).toArray();

        return {
            sets: sets.map(set => ({
                id: set._id,
                name: set.name
            }))
        };
    }

    async getCards(req) {

        if (!req.body.subsetId || !RE_OBJECT_ID.test(req.body.subsetId)) {
            throw Error('Subset is not specified');
        }

        let session = await this.getSession(req);
        let subsetId = ObjectId(req.body.subsetId);

        let subset = await this.db.collection('subsets').findOne({
            _id: subsetId
        });

        if (!subset || subset.userId !== session.userId) {
            throw Error('Cannot find subset');
        }

        let cards = await this.db.collection('cards').find({
            subsetId
        }).toArray();

        return {
            cards: cards.map(card => ({
                id: card._id,
                source: card.source,
                target: card.target,
                comment: card.comment
            }))
        };
    }

    async addSubset(req) {

        if (!req.body.name) {
            throw Error('Subset name cannot be empty');
        }

        if (!req.body.setId || !RE_OBJECT_ID.test(req.body.setId)) {
            throw Error('Unknown set id');
        }

        let session = await this.getSession(req);

        let result = await this.db.collection('subsets').insertOne({
            userId: session.userId,
            setId: ObjectId(req.body.setId),
            created: new Date(),
            name: req.body.name
        });

        return {
            success: true,
            id: result.insertedId
        };
    }

    async getSubsets(req) {

        if (!req.body.setId || !RE_OBJECT_ID.test(req.body.setId)) {
            throw Error('Unknown set id');
        }

        let session = await this.getSession(req);

        let subsets = await this.db.collection('subsets').find({
            userId: session.userId,
            setId: ObjectId(req.body.setId)
        }).toArray();

        return {
            subsets: subsets.map(subset => ({
                id: subset._id,
                name: subset.name
            }))
        };
    }

    async getSession(req) {

        let sessionId = req.body.sessionId;

        if (!sessionId || !RE_OBJECT_ID.test(sessionId)) {
            throw Error('Unknown session');
        }

        let session = await this.db.collection('sessions').findOne({
            _id: ObjectId(sessionId)
        });

        if (!session) {
            throw Error('Unknown session');
        }

        return session;
    }

    async selectCard(req) {

        let session = await this.getSession(req);

        let answerId = req.body.answer;
        let cardId = req.body.cardId;

        if (!RE_OBJECT_ID.test(cardId)) {
            throw Error('Wrong card id');
        }

        cardId = ObjectId(cardId);

        let card = await this.db.collection('cards').findOne({_id: cardId});

        if (!card || card.userId !== session.userId) {
            throw Error('Wrong card id');
        }

        // noinspection EqualityComparisonWithCoercionJS
        let correctAnswer = card.answerId == answerId;

        await this.db.collection('answers').insertOne({
            userId: session.userId,
            cardId: cardId,
            setId: card.setId,
            subsetId: card.subsetId,
            isCorrect: correctAnswer,
            created: new Date()
        });

        return {
            correctAnswer: card.answerId
        };
    }

    async getCard(req) {

        let session = await this.getSession(req);

        let setId = req.body.setId;

        if (!setId || !RE_OBJECT_ID.test(setId)) {
            throw Error('Wrong set id');
        }

        setId = ObjectId(setId);

        let set = await this.db.collection('sets').findOne({
            _id: setId
        });

        if (!set || set.userId !== session.userId) {
            throw Error('Wrong set id');
        }

        let cards = await this.db.collection('cards').find({
            setId
        }).toArray();

        // get last 5 answers for each card

        let answers = await this.db.collection('answers').aggregate([
            {$match: {setId}},
            {$sort: {'created': 1}},
            {
                $group: {
                    _id: '$cardId',
                    count: {'$sum': 1},
                    items: {
                        $push: '$isCorrect'
                    }
                }
            },
            {$project: {items: {$slice: ['$items', -5]}}}
        ]).toArray();

        for (let answer of answers) {

            let card = cards.find(r => r._id.equals(answer._id));
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

        for (let card of cards) {
            card.score = card.score !== undefined ? card.score : -1;
        }

        // we place records which will have higher probability at the beginning of the list
        // records without answers will have highest probability among others
        // records with lower score will have higher probability than records with higher score
        // this way we guarantee to take all unanswered records as fast as possible and then concentrate on records
        // with lower score (i.e. which have less correct answers)

        cards.sort((a, b) => {
            return a.score - b.score;
        });

        // console.log(1);

        // console.log(JSON.stringify(cards.map(card => ({
        //     answers: card.answers,
        //     score: card.score,
        //     source: card.source
        // })), null, ' '));

        //console.log(answers);

        //console.log(records);

        let record;

        if (cards[0].score === -1) { // i.e. it was never chosen
            record = cards[0];
        } else {

            for (;;) {

                let index = Math.random();

                // nonlinear probability distribution to take first items more often
                // note that [0;1) * [0;1) also belongs to [0;1)
                index = Math.floor(index * index * cards.length);

                // console.log('2 ' + index + ' ' + cards.length);

                // choose a record
                record = cards[index];

                let start = index, end = index+1;

                while (start > 0 && cards[start-1].score === record.score) {
                    start--;
                }

                while (end < cards.length && cards[end].score === record.score) {
                    end++;
                }

                if (end-start > 1) {
                    // if we have more than one record with the same score we choose randomly from the list of items with the same score
                    index = start + Math.floor(Math.random()*(end-start));
                    record = cards[index];
                    //console.log('2.1: ' + (end-start) + ' ' + index);
                }

                // console.log('3', record);

                // ensure it is not the same answer we got last three times; assume that
                // lastAnswers is sorted as 'first item is the newest one'

                if (cards.length < 6) { // exception: we don't check for last cards if we have very limited set of existing cards
                    console.log('too less cards');
                    record = cards[index];
                    break;
                }

                let lastAnswersCount = Math.min(3, req.body.lastAnswers ? req.body.lastAnswers.length : 0);
                let cardId = record._id.toHexString();
                let i;
                console.log('cardId: ' + cardId + ', count: ' + lastAnswersCount + ', lastAnswers: ', req.body.lastAnswers);
                for (i = 0; i < 3 && i < lastAnswersCount; i++) {
                    if (req.body.lastAnswers[i] === cardId) {
                        break;
                    }
                }
                console.log(i);
                if (i >= lastAnswersCount) {
                    break;
                }
            }
        }

        let subsetId = record.subsetId;

        // console.log('4 ' + subsetId + ' ' + typeof subsetId);

        let allTargets = cards
            .filter(r => !r._id.equals(record._id) && r.subsetId.equals(subsetId))
            .map(r => ({text: r.target, id: r.answerId }))
            .sort((a, b) => (Math.abs(a.text.length-record.target.length)-Math.abs(b.text.length-record.target.length)));

        //console.log(record.target);
        //console.log(JSON.stringify(allTargets, null, ' '));

        // console.log('5 ' + allTargets.length);

        let targets = [];

        while (allTargets.length > 0 && targets.length < 4) {
            if (allTargets.length < 4) {
                targets.push(allTargets.pop());
                continue;
            }

            let index = Math.random();
            index = Math.floor(index * index * allTargets.length/2);

            targets.push(allTargets[index]);
            allTargets.splice(index, 1);
        }

        targets.splice(Math.floor(Math.random()*4), 0, {
            text: record.target,
            id: record.answerId
        });

        // console.log(6);

        return {
            items: targets,
            source: record.source,
            comment: record.comment,
            id: record._id
        };
    }

    async login(req) {

        let sessionId = req.body.sessionId;

        if (sessionId && RE_OBJECT_ID.test(sessionId)) {

            let session = await this.db.collection('sessions').findOne({
                _id: ObjectId(sessionId)
            });

            if (session) {

                //console.log('found session');

                return {
                    success: true
                };
            }
        }

        let accessToken = req.body.accessToken;

        if (!accessToken) {
            return {
                success: false
            };
        }

        let checkUrl = 'https://graph.facebook.com/me?fields=id&access_token=' + accessToken;

        let checkResult = await FetchService.get(checkUrl);

        if (!checkResult || !checkResult.id) {
            throw Error('Cannot validate access token');
        }

        let userId = checkResult.id;

        let insertStatus = await this.db.collection('sessions').insertOne({
            userId: userId,
            created: new Date()
        });

        if (insertStatus.insertedCount !== 1) {
            throw Error('Cannot update session');
        }

        sessionId = insertStatus.insertedId;

        return {
            success: true,
            sessionId: sessionId
        };
    }
}
