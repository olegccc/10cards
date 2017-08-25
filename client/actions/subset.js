import BackendApi from "../utils/backendApi";

export default class Subset {

    static async getSubsets(setId) {

        return await BackendApi.getSubsets(setId);
    }

    static async addSubset(setId, name) {

        return await BackendApi.addSubset(setId, name);
    }

    static async addCard(setId, subsetId, source, target, comment) {

        return await BackendApi.addCard(setId,
            subsetId,
            source,
            target,
            comment);
    }

    static async getCards(subsetId) {

        return await BackendApi.getCards(subsetId);
    }

    static async deleteCard(id) {

        await BackendApi.deleteCard(id);
    }
}
