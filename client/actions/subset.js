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
}