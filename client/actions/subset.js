import FetchService from '../../shared/fetchService'

export default class Subset {

    static async getSubsets(setId) {

        let sessionId = localStorage.getItem('sessionId');

        let response = await FetchService.post('/subsets', {
            sessionId,
            setId
        });

        return response.subsets;
    }

    static async addSubset(setId, name) {

        let sessionId = localStorage.getItem('sessionId');

        let response = await FetchService.post('/addSubset', {
            sessionId,
            setId,
            name
        });

        return response.id;
    }

    static async addCard(setId, subsetId, source, target, comment) {

        let sessionId = localStorage.getItem('sessionId');

        await FetchService.post('/addCard', {
            sessionId,
            setId,
            subsetId,
            source,
            target,
            comment
        })
    }

    static async getCards(subsetId) {

        let sessionId = localStorage.getItem('sessionId');

        let response = await FetchService.post('/cards', {
            sessionId,
            subsetId
        });

        return response.cards;
    }

    static async deleteCard(id) {

        let sessionId = localStorage.getItem('sessionId');

        await FetchService.post('/deleteCard', {
            sessionId,
            cardId: id
        });
    }
}
