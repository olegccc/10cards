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
    'post:addCard'
];

const RE_OBJECT_ID = /^[0-9a-fA-F]{24}$/;

const mongoDbUrl = 'mongodb://localhost:27017/10cards';

export default class ServerController {

    constructor(server, deviceApi) {
        ServerUtils.bootstrap(this, server, ALL_METHODS);
    }

    async initialize() {
        this.db = await connect(mongoDbUrl);
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
            success: true,
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
            success: true,
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

        let records = await this.db.collection('cards').find({
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

            let record = records.find(r => r._id.equals(answer._id));
            if (!record) {
                console.log('Cannot find record ' + answer._id);
                continue;
            }

            record.answers = answer.count;

            if (answer.items.length) {
                let items = answer.items.map(i => i ? 1 : 0);
                record.score = items.reduce((a, b) => a + b, 0) / items.length;
            }
        }

        // we place records which will have higher probability at the beginning of the list
        // records without answers will have highest probability among others
        // records with lower score will have higher probability than records with higher score
        // this way we guarantee to take all unanswered records as fast as possible and then concentrate on records
        // with lower score (i.e. which have less correct answers)

        records.sort((a, b) => {
            if (!a.answers) {
                return 1;
            }
            if (!b.answers) {
                return -1;
            }
            return b.score - a.score;
        });

        console.log(1);

        //console.log(answers);

        //console.log(records);

        // we use nonlinear probability distribution to take first items more often
        let index = Math.random();
        index = Math.floor(index * index * records.length);

        console.log('2 ' + index + ' ' + records.length);

        // chose a record
        let record = records[index];

        console.log('3', record);

        let subsetId = record.subsetId;

        console.log('4 ' + subsetId + ' ' + typeof subsetId);

        let allTargets = records
            .filter(r => !r._id.equals(record._id) && r.subsetId.equals(subsetId))
            .map(r => ({text: r.target, id: r.answerId }))
            .sort((a, b) => (Math.abs(a.text.length-record.target.length)-Math.abs(b.text.length-record.target.length)));

        console.log('5 ' + allTargets.length);

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

        console.log(6);

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

                console.log('found session');

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
