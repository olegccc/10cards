import { Map } from 'immutable'
import SetActions from '../actions/set'
import Configuration from '../utils/configuration'

const defaultState = Map({
    sets: [],
    setId: Configuration.getSetId()
});

function reducer(state = defaultState, action) {
    switch (action.type) {
        case SetActions.SET_SETS_LIST:
            return state.set('sets', action.sets);
        case SetActions.SET_CURRENT_SET:
            Configuration.setSetId(action.setId);
            return state.set('setId', action.setId);
    }

    return state;
}

export default reducer;
