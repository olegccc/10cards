import { Map } from 'immutable'
import StateActions from '../actions/State'

const defaultState = Map({
    loginLoading: true,
    loggedIn: false,
    loginError: null
});

function reducer(state = defaultState, action) {
    switch (action.type) {
        case StateActions.LOGIN_SUCCESS:
            return state.merge({
                loginLoading: false,
                loggedIn: true
            });
        case StateActions.LOGIN_ERROR:
            return state.merge({
                loginLoading: false,
                loggedIn: false,
                loginError: action.error
            });
    }

    return state;
}

export default reducer;