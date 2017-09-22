import ServerUtils from './serverUtils'
import {connect, ObjectId} from 'mongodb'
import FetchService from '../shared/fetchService'
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
    'post:reset',
    'post:setSetBlockMode',
    'post:setActiveSet',
    'post:readCard',
    'post:editCard'
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

    async getSetAndSession(req, useDefault, dontThrowOnNoSet) {

        let {setId} = req;

        let session = await this.getSession(req);

        let set;

        if (!setId && useDefault) {
            set = await this.db.collection('sets').findOne({
                userId: session.userId,
                active: true
            });

            if (!set) {
                set = await this.db.collection('sets').find({
                    userId: session.userId
                }).next();

                if (!set) {
                    if (dontThrowOnNoSet) {
                        return {};
                    } else {
                        throw Error('No set available');
                    }
                }
            }

        } else {
            if (!setId || !RE_OBJECT_ID.test(setId)) {
                throw Error('Set is not specified');
            }

            setId = ObjectId(setId);

            set = await this.db.collection('sets').findOne({
                _id: setId
            });
        }

        if (!set || set.userId !== session.userId) {
            throw Error('Cannot find set');
        }

        return {
            set,
            session
        };
    }

    async getCardAndSession(req) {

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

    async readCard(req) {
        let {card} = await this.getCardAndSession(req);

        return {
            source: card.source,
            target: card.target,
            sourceComment: card.sourceComment,
            targetComment: card.targetComment,
            answers: card.answers
        };
    }

    async deleteCard(req) {

        let {card, session} = await this.getCardAndSession(req);

        await this.db.collection('answers').removeMany({
            cardId: card._id
        });

        await this.db.collection('cards').removeOne({
            _id: card._id
        });

        return {
            success: true
        };
    }

    async addOrEditCard(req, edit) {

        let {source, target, sourceComment, targetComment, answers} = req;
        let card;

        if (edit) {
            let response = await this.getCardAndSession(req);
            card = response.card;
        }

        let {set, session} = await this.getSetAndSession(req, true);

        source = source.trim();
        target = target.trim();

        if (!edit) {
            card = await this.db.collection('cards').findOne({
                source
            });

            if (card) {
                throw Error('Card with the same source text already exists');
            }

            card = await this.db.collection('cards').findOne({
                target
            });

            if (card) {
                throw Error('Card with the same target text already exists');
            }
        }

        let collection = this.db.collection('cards');

        let props = {
            source,
            target,
            sourceComment,
            targetComment,
            answers
        };

        let result;

        if (edit) {
            props.updated = new Date();
            result = await collection.updateOne({
                _id: card._id
            }, {
                $set: props
            });
        } else {

            props.userId = session.userId;
            props.created = new Date();
            props.setId = set._id;
            props.answerId = CardSelector.generateAnswerId();

            result = await collection.insertOne(props);
        }

        result.set = set;
        return result;
    }

    async editCard(req) {
        await this.addOrEditCard(req, true);
        return {
            success: true
        };
    }

    async addCard(req) {

        let {insertedId, set} = await this.addOrEditCard(req, false);

        return {
            id: insertedId,
            name: set.name,
            count: await this.db.collection('cards').count({
                setId: set._id
            })
        };
    }

    async getSetStatistics(req) {

        let {set} = await this.getSetAndSession(req, true);

        let count = await this.db.collection('cards').count({
            setId: set._id
        });

        return {
            name: set.name,
            count
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

    async getSetSettings(req) {

        let {set} = await this.getSetAndSession(req, true);

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

        await this.db.collection('sets').updateOne({
            _id: set._id
        }, {
            $set: {
                currentBlock: {}
            }
        });

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
            // prepare to remove records with high quality
            // use 50% of hardest questions
            let hardestCount = Math.floor(cardIds.length*0.5);
            // use 20% of random questions
            let randomCount = Math.floor(cardIds.length*0.2);
            let cardsToRemove = cardIds.slice(0, hardestCount);
            cardIds.splice(0, hardestCount);
            for (let i = 0; i < randomCount; i++) {
                let pos = Math.floor(Math.random()*cardIds.length);
                cardsToRemove.push(cardIds[pos]);
                cardIds.splice(pos, 1);
            }
            // remove answers related to records with low quality (i.e. the hardest ones)

            await this.db.collection('cycleAnswers').removeMany({
                setId: set._id,
                cardId: {
                    $in: cardIds
                }
            });
        } else {
            await this.db.collection('cycleAnswers').removeMany({
                setId: set._id
            });
        }

        await this.db.collection('sets').updateOne({
            _id: set._id
        }, {
            $set: {
                currentBlock: {}
            }
        });

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
                sourceComment: card.sourceComment,
                targetComment: card.targetComment,
                answers: card.answers
            }))
        };
    }

    async selectCard(req) {

        let {card, session} = await this.getCardAndSession(req);
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

            if (correct) {
                set.currentBlock[card._id] = false;

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

        let {set, session} = await this.getSetAndSession(req, true, true);

        if (!set) {
            return {
                noSets: true
            };
        }

        const cardSelector = new CardSelector(this.db, set, session);

        return await cardSelector.selectCard();
    }

    async login({sessionId, accessToken}) {

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
