import BackendApi from '../utils/backendApi'

export default class Set {

    static SET_SETS = 'set_sets';

    static addNewSet(name) {

        return async dispatch => {

            let id = await BackendApi.addSet(name);

            dispatch(Set.refresh());

            return id;
        }
    }

    static refresh() {

        return async dispatch => {

            dispatch({
                type: Set.SET_SETS,
                sets: await BackendApi.getSets()
            });
        }
    }
}