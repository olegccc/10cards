export default class Configuration {

    static getSessionId() {
        return sessionStorage.getItem('sessionId');
    }

    static setSessionId(sessionId) {
        sessionStorage.setItem('sessionId', sessionId);
    }

    static getSetId() {
        return sessionStorage.getItem('setId');
    }

    static setSetId(setId) {
        sessionStorage.setItem('setId', setId);
    }
}
