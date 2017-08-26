import StateActions from '../actions/state'
import SetActions from '../actions/set'
import BackendApi from '../utils/backendApi'

export default class Card {

    static SET_CARD = 'set_cart';
    static SET_CHOICE = 'set_choice';
    static SET_ANSWER = 'set_answer';
    static RESET_CARD = 'reset_card';

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

            let { card, set } = getState();

            let lastAnswers = card.get('lastAnswers').toArray();

            let setId = set.get('setId');

            if (!setId) {
                let sets = await BackendApi.getSets();

                if (sets.length === 0) {
                    // we don't have any set yet
                    dispatch(StateActions.onFinishLoading());
                    dispatch(StateActions.onError('No card set is defined, nothing to load'));
                    return;
                }

                setId = sets[0].id;
                dispatch(SetActions.setCurrentSet(setId));
            }

            const response = await BackendApi.getCard(lastAnswers, setId);

            dispatch({
                type: Card.SET_CARD,
                items: response.items,
                source: response.source,
                comment: response.comment,
                cardId: response.id
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