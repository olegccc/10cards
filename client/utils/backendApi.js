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

    static async selectCard(cardId, answer) {
        return await BackendApi.execute('/select', {
            answer,
            cardId
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
                         subsetId,
                         source,
                         target,
                         comment) {

        let response = await BackendApi.execute('/addCard', {
            setId,
            subsetId,
            source,
            target,
            comment
        });

        return response.id;
    }

    static async addSubset(setId, name) {

        let response = await BackendApi.execute('/addSubset', {
            setId,
            name
        });

        return response.id;
    }

    static async getSubsets(setId) {

        let response = await BackendApi.execute('/subsets', {
            setId
        });

        return response.subsets;
    }

    static async getCards(subsetId) {

        let response = await BackendApi.execute('/cards', {
            subsetId
        });

        return response.cards;
    }

    static async deleteCard(cardId) {

        await BackendApi.execute('/deleteCard', {
            cardId
        });
    }
}