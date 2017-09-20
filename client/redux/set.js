import { Map } from 'immutable'
import SetActions from '../actions/set'

const defaultState = Map({
    sets: null
});

function reducer(state = defaultState, action) {
    switch (action.type) {
        case SetActions.SET_SETS_LIST:
            return state.set('sets', action.sets);
    }

    return state;
}

export default reducer;
