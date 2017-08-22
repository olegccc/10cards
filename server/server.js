import https from 'https'
import http from 'http'
import ServerController from './serverController'
import path from 'path'
import 'isomorphic-fetch'

let useHttps = false;

let port;

if (process.env.PORT) {
    port = process.env.PORT;
} else if (process.argv.length > 2) {
    port = Number(process.argv[2]) || 8080;
} else {
    port = 8080;
}

const server = useHttps ? https.createServer(require('../config/credentials')) : http.createServer();

function getHandler(file) {
    return (req, res) => {
        let filePath = path.join(process.cwd(), file);
        res.sendFile(filePath, {
            cacheControl: false
        });
    }
}

const module = new ServerController(server, false);

module.initialize().then(() => {
    const app = module.getApp();

    server.on('request', app);

    app.get('/', getHandler('/client.html'));

    ['/client.html', '/client.js', '/client.js.map']
        .forEach(file => app.get(file, getHandler(file)));

    server.listen(port, () => {
        console.log('Server started at :' + port);
    });

}, (error) => {
    console.log('Controller initialization error: ' + error);
});

