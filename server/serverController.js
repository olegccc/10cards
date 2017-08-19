import ServerUtils from './serverUtils'
import {connect, ObjectId} from 'mongodb'
import FetchService from '../shared/fetchService'

const ALL_METHODS = [
    'post:card:getCard',
    'post:login',
    'post:select:selectCard',
    'post:sets:getSets'
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

    async getSets(req) {

        let session = await this.getSession(req);

        let sets = await this.db.collection('sets').find({
            userId: session.userId
        }).toArray();

        return {
            sets: sets.map(set => set._id)
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

        let card = await this.db.collection('cards').findOne({ _id: cardId});

        if (!card) {
            throw Error('Wrong card id');
        }

        let setId = card.setId;

        let set = await this.db.collection('sets').findOne({ _id: setId });

        if (!set) {
            throw Error('Wrong card id');
        }

        if (set.userId !== session.userId) {
            throw Error('Wrong card id');
        }

        // noinspection EqualityComparisonWithCoercionJS
        let correctAnswer = card.correct == answerId;

        await this.db.collection('answers').insertOne({
            userId: session.userId,
            cardId: cardId,
            setId: setId,
            answer: answerId,
            isCorrect: correctAnswer,
            created: new Date()
        });

        return {
            correctAnswer: card.correct
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
            setId: setId
        }).toArray();

        // get last 5 answers for each card

        let answers = await this.db.collection('answers').aggregate([
            { $match: { setId: ObjectId("59984c86a53142e9b9629fe1") } },
            { $sort: {"created" : 1} },
            { $group: {
                _id: "$cardId",
                count: {"$sum":1},
                items: { $push: "$isCorrect" }
            }},
            { $project: { items: { $slice: [ "$items", -5  ] } } }
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

        //console.log(answers);

        console.log(records);

        // we use nonlinear probability distribution to take first items more often
        let index = Math.random();
        index = Math.floor(index * index * records.length);

        let record = records[index];

        return {
            items: record.items.map(item => ({
                text: item.text,
                id: item.id
            })),
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

        sessionId = insertStatus.insertedId.toHexString();

        return {
            success: true,
            sessionId: sessionId
        };
    }
}
