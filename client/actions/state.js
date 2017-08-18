import FetchService from '../../shared/fetchService'

export default class State {

    static LOGIN_SUCCESS = 'login_success';
    static LOGIN_ERROR = 'login_error';

    static onLoginSuccess() {

        return async dispatch => {

            dispatch({
                type: State.LOGIN_SUCCESS
            });
        }
    }

    static onLoginError(error) {

        return async dispatch => {

            dispatch({
                type: State.LOGIN_ERROR,
                error
            });
        }
    }
}
