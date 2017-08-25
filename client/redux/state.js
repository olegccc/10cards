import { Map } from 'immutable'
import StateActions from '../actions/state'

const defaultState = Map({
    loginLoading: true,
    loggedIn: false,
    error: null,
    loading: false
});

function reducer(state = defaultState, action) {
    switch (action.type) {
        case StateActions.LOGIN_SUCCESS:
            return state.merge({
                loginLoading: false,
                loggedIn: true,
                error: ''
            });
        case StateActions.LOGIN_ERROR:
            return state.merge({
                loginLoading: false,
                loggedIn: false
            });
        case StateActions.LOADING:
            if (action.loading) {
                return state.set('loading', true);
            } else {
                return state.merge({
                    loading: false,
                    error: ''
                });
            }
        case StateActions.ERROR:
            return state.merge({
                error: action.error,
                loginLoading: false,
                loading: false
            });
    }

    return state;
}

export default reducer;
