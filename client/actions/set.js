import BackendApi from '../utils/backendApi'
import CardActions from './card'

export default class Set {

    static SET_SETS_LIST = 'set_sets_list';

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
                type: Set.SET_SETS_LIST,
                sets: await BackendApi.getSets()
            });
        }
    }

    static setCurrentSet(setId) {

        return async dispatch => {

            dispatch(CardActions.reset());

            await BackendApi.setActiveSet(setId);
        }
    }
}