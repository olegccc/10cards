import FetchService from '../../shared/fetchService'

export default class State {

    static LOGIN_SUCCESS = 'login_success';
    static LOGIN_ERROR = 'login_error';
    static LOADING = 'loading';
    static ERROR = 'error';

    static onStartLoading() {
        return async dispatch => {
            dispatch({
                type: State.LOADING,
                loading: true
            });
        }
    }

    static onFinishLoading() {
        return async dispatch => {
            dispatch({
                type: State.LOADING,
                loading: false
            });
        }
    }

    static onLoginSuccess() {

        return async dispatch => {

            dispatch({
                type: State.LOGIN_SUCCESS
            });
        }
    }

    static onLoginError() {

        return async dispatch => {

            dispatch({
                type: State.LOGIN_ERROR
            });
        }
    }

    static onError(error) {

        return async dispatch => {

            dispatch({
                type: State.ERROR,
                error
            });
        }
    }
}
