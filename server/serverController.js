import ServerUtils from './serverUtils'
import {connect, ObjectId} from 'mongodb'
import FetchService from '../shared/fetchService'
import sha256 from 'js-sha256'
import CardSelector from './cardSelector'

const ALL_METHODS = [
    'post:card:getCard',
    'post:login',
    'post:select:selectCard',
    'post:sets:getSets',
    'post:addSet',
    'post:addCard',
    'post:cards:getCards',
    'post:deleteCard',
    'post:setStatistics:getSetStatistics',
    'post:deleteSet',
    'post:getSetSettings',
    'post:setSetSimpleMode',
    'post:startOver',
    'post:reset'
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

    async getSetAndSession(req) {

        let {setId} = req.body;

        if (!setId || !RE_OBJECT_ID.test(setId)) {
            throw Error('Set is not specified');
        }

        let session = await this.getSession(req);
        setId = ObjectId(setId);

        let set = await this.db.collection('sets').findOne({
            _id: setId
        });

        if (!set || set.userId !== session.userId) {
            throw Error('Cannot find set');
        }

        return {
            set,
            session
        };
    }

    async getCardAnsSession(req) {

        let {cardId} = req.body;

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

        return {
            card,
            session
        };
    }

    async deleteCard(req) {

        let {card, session} = await this.getCardAnsSession(req);

        await this.db.collection('answers').removeMany({
            cardId: card.cardId
        });

        await this.db.collection('cards').removeOne({
            _id: card.cardId
        });

        return {
            success: true
        };
    }

    async addCard(req) {

        let {source, target, comment} = req.body;

        let {set, session} = await this.getSetAndSession(req);

        let result = await this.db.collection('cards').insertOne({
            userId: session.userId,
            created: new Date(),
            setId: set._id,
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

        let {name} = req.body;

        if (!name) {
            throw Error('Set name cannot be empty');
        }

        let session = await this.getSession(req);

        let result = await this.db.collection('sets').insertOne({
            userId: session.userId,
            created: new Date(),
            name: name,
            simpleMode: true
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

    async getSetStatistics(req) {

        let {set} = await this.getSetAndSession(req);

        let count = await this.db.collection('cards').count({
            setId: set._id
        });

        return {
            name: set.name,
            count
        };
    }

    async getSetSettings(req) {

        let {set} = await this.getSetAndSession(req);

        return {
            name: set.name,
            simpleMode: set.simpleMode === undefined || set.simpleMode
        };
    }

    async deleteAnswers(setId) {
        await this.db.collection('cycleAnswers').removeMany({
            setId
        });
        await this.db.collection('answers').removeMany({
            setId
        });
    }

    async setSetSimpleMode(req) {

        let {set} = await this.getSetAndSession(req);
        let {mode} = req.body;

        await this.db.collection('sets').updateOne({
            _id: set._id
        }, {
            $set: {
                simpleMode: !!mode
            }
        });

        await this.deleteAnswers(set._id);

        return {
            success: true
        };
    }

    async reset(req) {

        let {set} = await this.getSetAndSession(req);
        await this.deleteAnswers(set._id);

        return {
            success: true
        };
    }

    async startOver(req) {

        let {set} = await this.getSetAndSession(req);

        if (set.simpleMode === undefined || set.simpleMode) {
            throw Error('Available only in extended mode');
        }

        if (req.body.onlyAnswered) {
            await this.db.collection('cycleAnswers').removeMany({
                setId: set._id,
                isCorrect: true
            });
        } else {
            await this.db.collection('cycleAnswers').removeMany({
                setId: set._id
            });
        }

        return {
            success: true
        };
    }

    async deleteSet(req) {

        let {set} = await this.getSetAndSession(req);

        let count = await this.db.collection('cards').count({
            setId: set._id
        });

        if (count > 0) {
            throw Error('Cannot delete non-empty set');
        }

        await this.db.collection('sets').removeOne({
            _id: set._id
        });

        return {
            success: true
        };
    }

    async getCards(req) {

        let {set} = await this.getSetAndSession(req);

        let cards = await this.db.collection('cards').find({
            setId: set._id
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

    async getSession(req) {

        let {sessionId} = req.body;

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

        let {card, session} = await this.getCardAnsSession(req);
        let {answerId} = req.body;

        let answer = {
            userId: session.userId,
            cardId: card._id,
            setId: card.setId,
            answerId,
            isCorrect: answerId === card.answerId,
            created: new Date()
        };

        await this.db.collection('answers').insertOne(answer);
        await this.db.collection('cycleAnswers').insertOne(answer);

        return {
            correctAnswer: card.answerId
        };
    }

    async getCard(req) {

        let {set, session} = await this.getSetAndSession(req);

        const cardSelector = new CardSelector(this.db, set, session, req);

        return await cardSelector.selectCard();
    }

    async login(req) {

        let {sessionId, accessToken} = req.body;

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
