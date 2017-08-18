import fs from 'fs';
import path from 'path';

let configPath = __dirname;

if (!fs.existsSync(path.join(configPath, 'server.key'))) {
    configPath = path.resolve(path.join(__dirname, '../config'));

    if (!fs.existsSync(path.join(configPath, 'server.key'))) {
        configPath = path.resolve(path.join(__dirname, '../../config'));
    }
}

const privateKey = fs.readFileSync(path.join(configPath, 'server.key')).toString();
const certificate = fs.readFileSync(path.join(configPath, 'server.crt')).toString();

export default {
    key: privateKey,
    cert: certificate
};
