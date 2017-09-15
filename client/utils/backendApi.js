import FetchService from '../../shared/fetchService'
import Configuration from './configuration'

export default class BackendApi {

    static async execute(name, options) {

        let sessionId = Configuration.getSessionId();

        if (sessionId) {
            if (!options) {
                options = {};
            }
            options.sessionId = sessionId;
        }

        return await FetchService.post(name, options);
    }

    static async selectCard(cardId, answerId) {
        return await BackendApi.execute('/select', {
            answerId,
            cardId
        });
    }

    static async startOver(setId, onlyAnswered) {
        await BackendApi.execute('/startOver', {
            setId,
            onlyAnswered
        });
    }

    static async getSets() {
        let response = await BackendApi.execute('/sets');
        return response.sets;
    }

    static async getCard(lastAnswers, setId) {
        return await BackendApi.execute('/card', {
            lastAnswers,
            setId
        });
    }

    static async addSet(name) {

        let response = await BackendApi.execute('/addSet', {
            name
        });

        return response.id;
    }

    static async addCard(setId,
                         source,
                         target,
                         comment) {

        let response = await BackendApi.execute('/addCard', {
            setId,
            source,
            target,
            comment
        });

        return response.id;
    }

    static async getCards(setId) {

        let response = await BackendApi.execute('/cards', {
            setId
        });

        return response.cards;
    }

    static async deleteCard(cardId) {

        await BackendApi.execute('/deleteCard', {
            cardId
        });
    }

    static async getSetStatistics(setId) {

        return await BackendApi.execute('/setStatistics', {
            setId
        });
    }

    static async getSetSettings(setId) {

        return await BackendApi.execute('/getSetSettings', {
            setId
        });
    }

    static async setSetSimpleMode(setId, mode) {
        await BackendApi.execute('/setSetSimpleMode', {
            setId,
            mode
        });
    }

    static async deleteSet(setId) {
        return await BackendApi.execute('deleteSet', {
            setId
        });
    }
}