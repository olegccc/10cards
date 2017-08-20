import FetchService from '../../shared/fetchService'

export default class Set {

    static SET_SETS = 'set_sets';

    static addNewSet(name) {
        return async dispatch => {

            let sessionId = localStorage.getItem('sessionId');

            let response = await FetchService.post('/addSet', {
                sessionId,
                name
            });

            dispatch(Set.refresh());

            return response.id;
        }
    }

    static refresh() {
        return async dispatch => {

            let sessionId = localStorage.getItem('sessionId');

            let response = await FetchService.post('/sets', {
                sessionId
            });

            let sets = response.sets;

            dispatch({
                type: Set.SET_SETS,
                sets
            });
        }
    }
}