import FacebookInit from './facebookInit'
import FetchService from '../../shared/fetchService'
import StateActions from '../actions/state'

export default class Authenticate {

    static async login(dispatch) {

        try {
            let response = await FacebookInit.login();

            if (!response.authResponse || !response.authResponse.accessToken) {
                throw Error('Cannot login');
            }

            await Authenticate.finishAuth(response, dispatch);

        } catch (error) {
            dispatch(StateActions.onLoginError(error.message));
            return false;
        }

        return true;
    }

    static async finishAuth(response, dispatch) {

        let accessToken = response.authResponse.accessToken;

        response = await FetchService.post('/login', {
            accessToken
        });

        if (!response.success || !response.sessionId) {
            throw Error('Cannot login');
        }

        localStorage.setItem('sessionId', response.sessionId);

        dispatch(StateActions.onLoginSuccess());
    }

    static async start(dispatch) {

        try {

            let sessionId = localStorage.getItem('sessionId');

            if (sessionId) {

                let response = await FetchService.post('/login', {
                    sessionId
                });

                if (response.success) {

                    dispatch(StateActions.onLoginSuccess());
                    return true;
                }
            }

            let response = await FacebookInit.init();

            if (response.status !== 'connected' || !response.authResponse || !response.authResponse.accessToken) {
                dispatch(StateActions.onLoginError('Not logged in'));
                return;
            }

            await Authenticate.finishAuth(response, dispatch);

        } catch (error) {
            dispatch(StateActions.onLoginError(error.message));
            return false;
        }

        return true;
    }
}
