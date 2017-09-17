import ServerUtils from './serverUtils'
import {connect, ObjectId} from 'mongodb'
import FetchService from '../shared/fetchService'
import sha256 from 'js-sha256'
import CardSelector from './cardSelector'
import _ from 'lodash'

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
    'post:reset',
    'post:setSetBlockMode',
    'post:setActiveSet'
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

    async getSession({sessionId}) {

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

    async getSetAndSession(req) {

        let {setId} = req;

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

        let {cardId} = req;

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

        let {source, target, comment} = req;

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

        let {name} = req;

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
                name: set.name,
                active: set.active
            }))
        };
    }

    async setActiveSet(req) {

        let {set, session} = await this.getSetAndSession(req);

        await this.db.collection('sets').updateMany({
            userId: session.userId
        }, {
            $set: {
                active: false
            }
        });

        await this.db.collection('sets').updateOne({
            userId: session.userId,
            _id: set._id
        }, {
            $set: {
                active: true
            }
        });

        return {
            success: true
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

        await this.db.collection('sets').updateOne({
            _id: set._id
        }, {
            $set: {
                simpleMode: true,
                currentBlock: {}
            }
        });

        await this.deleteAnswers(set._id);

        return {
            success: true
        };
    }

    async setSetBlockMode(req) {

        let {set} = await this.getSetAndSession(req);
        let {blockSize} = req;
        if (!blockSize) {
            blockSize = 0;
        } else if (blockSize < 4) {
            blockSize = 4;
        } else if (blockSize > 20) {
            blockSize = 20;
        }

        await this.db.collection('sets').updateOne({
            _id: set._id
        }, {
            $set: {
                simpleMode: false,
                blockSize,
                currentBlock: {}
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

        let session = await this.getSession(req);

        let {setId, onlyHardest, onlyAnswered} = req;

        let set;

        if (setId) {

            if (!RE_OBJECT_ID.test(setId)) {
                throw Error('Set is not specified');
            }

            setId = ObjectId(setId);

            set = await this.db.collection('sets').findOne({
                _id: setId
            });

            if (!set || set.userId !== session.userId) {
                throw Error('Cannot find set');
            }

        } else {

            set = await this.db.collection('sets').findOne({
                userId: session.userId,
                active: true
            });

            if (!set) {
                set = await this.db.collection('sets').find({
                    userId: session.userId
                }).next();

                if (!set) {
                    return {
                        noSets: true
                    };
                }
            }

        }

        if (set.simpleMode === undefined || set.simpleMode) {
            throw Error('Available only in blocks mode');
        }

        if (onlyAnswered) {
            await this.db.collection('cycleAnswers').removeMany({
                setId: set._id,
                isCorrect: false
            });
        } else if (onlyHardest) {
            const cardSelector = new CardSelector(this.db, set, session);
            let cardIds = await cardSelector.getHardestCardIds();
            // remove records with high quality
            cardIds.splice(cardIds.length/2, cardIds.length);
            // remove answers related to records with low quality (i.e. the hardest ones)
            await this.db.collection('cycleAnswers').removeMany({
                setId: set._id,
                _id: {
                    $in: cardIds
                }
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

    async selectCard(req) {

        let {card, session} = await this.getCardAnsSession(req);
        let {answerId} = req;

        let correct = answerId === card.answerId;

        let answer = {
            userId: session.userId,
            cardId: card._id,
            setId: card.setId,
            answerId,
            isCorrect: correct,
            created: new Date()
        };

        let set = await this.db.collection('sets').findOne({
            _id: card.setId
        });

        let simpleMode = set.simpleMode === undefined || set.simpleMode;

        let insertCycleAnswer = true;

        if (!simpleMode && set.blockSize > 0 && set.currentBlock && set.currentBlock[card._id]) {

            set.currentBlock[card._id] = {
                answered: true,
                correct
            };

            await this.db.collection('sets').updateOne({
                _id: set._id
            }, {
                $set: {
                    currentBlock: set.currentBlock
                }
            });

            let hasUnanswered = false;
            let hasIncorrect = false;

            _.each(set.currentBlock, (value, key) => {
                if (!value.answered) {
                    hasUnanswered = true;
                }
                if (!value.correct) {
                    hasIncorrect = true;
                }
            });

            if (!hasUnanswered) {
                if (!hasIncorrect) {
                    set.currentBlock = {};
                } else {
                    _.each(set.currentBlock, (value, key) => {
                        if (!value.correct) {
                            value.answered = false;
                        }
                    });
                }

                await this.db.collection('sets').updateOne({
                    _id: set._id
                }, {
                    $set: {
                        currentBlock: set.currentBlock
                    }
                });
            }

            let currentCycleAnswer = await this.db.collection('cycleAnswers').findOne({
                cardId: card._id
            });

            if (currentCycleAnswer) {
                // we can repeat already answered question if it was answered incorrectly
                // but we should always indicate it was answered incorrectly in current cycle even if it was answered
                // correctly next time
                insertCycleAnswer = false;
            }
        }

        await this.db.collection('answers').insertOne(answer);

        if (insertCycleAnswer) {
            await this.db.collection('cycleAnswers').insertOne(answer);
        }

        return {
            correctAnswer: card.answerId
        };
    }

    async getCard(req) {

        let session = await this.getSession(req);

        let set = await this.db.collection('sets').findOne({
            userId: session.userId,
            active: true
        });

        if (!set) {
            set = await this.db.collection('sets').find({
                userId: session.userId
            }).next();

            if (!set) {
                return {
                    noSets: true
                };
            }
        }

        const cardSelector = new CardSelector(this.db, set, session);

        return await cardSelector.selectCard();
    }

    async login(req) {

        let {sessionId, accessToken} = req;

        if (sessionId && RE_OBJECT_ID.test(sessionId)) {

            let session = await this.db.collection('sessions').findOne({
                _id: ObjectId(sessionId)
            });

            if (session) {

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
