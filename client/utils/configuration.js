export default class Configuration {

    static getSessionId() {
        return sessionStorage.getItem('sessionId');
    }

    static setSessionId(sessionId) {
        sessionStorage.setItem('sessionId', sessionId);
    }
}
