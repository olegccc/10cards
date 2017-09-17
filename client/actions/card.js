import StateActions from '../actions/state'
import SetActions from '../actions/set'
import BackendApi from '../utils/backendApi'

export default class Card {

    static SET_CARD = 'set_cart';
    static SET_CHOICE = 'set_choice';
    static SET_ANSWER = 'set_answer';
    static RESET_CARD = 'reset_card';

    static startOver(onlyHardest) {

        return async (dispatch, getState) => {

            dispatch(StateActions.onStartLoading());

            let { card, set } = getState();
            let setId = set.get('setId');
            let lastAnswers = card.get('lastAnswers').toArray();

            await BackendApi.startOver(setId, false, onlyHardest);

            dispatch({
                type: Card.SET_CARD,
                ...await BackendApi.getCard(lastAnswers, setId)
            });

            dispatch(StateActions.onFinishLoading());
        };
    }

    static answerIncorrect() {

        return async (dispatch, getState) => {

            dispatch(StateActions.onStartLoading());

            let { card, set } = getState();
            let setId = set.get('setId');
            let lastAnswers = card.get('lastAnswers').toArray();

            await BackendApi.startOver(setId, true);

            dispatch({
                type: Card.SET_CARD,
                ...await BackendApi.getCard(lastAnswers, setId)
            });

            dispatch(StateActions.onFinishLoading());
        };
    }

    static setChoice(choiceId) {

        return async (dispatch, getState) => {

            dispatch(StateActions.onStartLoading());

            dispatch({
                type: Card.SET_CHOICE,
                answer: choiceId
            });

            let cardId = getState().card.get('cardId');

            const response = await BackendApi.selectCard(cardId, choiceId);

            dispatch({
                type: Card.SET_ANSWER,
                answerId: response.correctAnswer
            });

            dispatch(StateActions.onFinishLoading());
        }
    }

    static getNext() {

        return async (dispatch, getState) => {

            dispatch(StateActions.onStartLoading());

            dispatch({
                type: Card.SET_CARD,
                ...await BackendApi.getCard()
            });

            dispatch(StateActions.onFinishLoading());
        };

    }

    static reset() {
        return dispatch => {
            dispatch({
                type: Card.RESET_CARD
            });
        }
    }

}