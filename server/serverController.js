import ServerUtils from './serverUtils'
import {connect, ObjectId} from 'mongodb'
import FetchService from '../shared/fetchService'

const ALL_METHODS = [
    'post:choices:getChoices',
    'post:login'
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

    async getChoices(req, res) {

        let sessionId = req.body.sessionId;

        if (!sessionId) {
            throw Error('Unknown session');
        }

        let session = this.db.collection('session').findOne({
            _id: new ObjectId(sessionId)
        });

        if (!session) {
            throw Error('Unknown session');
        }

        let records = await this.db.collection('choices').find({}).toArray();

        //console.log(records);

        let record = records[Math.floor(Math.random()*records.length)];

        return {
            items: record.items,
            source: record.source,
            comment: record.comment
        }
    }

    async login(req, res) {

        let sessionId = req.body.sessionId;

        if (sessionId && RE_OBJECT_ID.test(sessionId)) {

            let session = this.db.collection('session').findOne({
                _id: new ObjectId(sessionId)
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
