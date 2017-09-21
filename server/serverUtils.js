import { Server as WebsocketServer } from 'ws'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'

export default class ServerUtils {

    static bootstrap(instance, server, methodList) {

        const app = express();

        instance.getApp = function() {
            return app;
        };

        app.use(bodyParser.json());
        //app.use(cookieParser());

        if (instance.onConnection) {
            const wss = new WebsocketServer({ server });
            wss.on('connection', ws => instance.onConnection(ws));
        }

        // signature:  post|get:url[:method]

        for (let methodDef of methodList) {
            methodDef = methodDef.split(':');
            if (methodDef.length < 2 || methodDef.length > 3) {
                continue;
            }
            let httpMethod = methodDef[0];
            if (httpMethod !== 'post' && httpMethod !== 'get') {
                continue;
            }
            let url = methodDef[1];
            let methodName = methodDef.length > 2 ? methodDef[2] : methodDef[1];
            app[httpMethod]('/' + url, async (req, res) => {
                try {
                    let response = await instance[methodName](req.body, req, res);
                    res.set('Content-Type', 'application/json');
                    res.end(response && JSON.stringify(response));
                } catch (error) {
                    res.set('Content-Type', 'application/json');
                    res.status(500).end(JSON.stringify({
                        error: error.message,
                        stack: error.stack
                    }));
                    console.error({
                        error: error.message,
                        stack: error.stack
                    });
                }
            });
        }
    }
}