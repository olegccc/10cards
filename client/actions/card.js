import FetchService from '../../shared/fetchService'
import StateActions from '../actions/state'

export default class Card {

    static SET_CARD = 'set_cart';
    static SET_CHOICE = 'set_choice';
    static SET_ANSWER = 'set_answer';

    static setChoice(choiceId) {

        return async (dispatch, getState) => {

            dispatch(StateActions.onStartLoading());

            dispatch({
                type: Card.SET_CHOICE,
                answer: choiceId
            });

            let cardId = getState().card.get('cardId');

            const response = await FetchService.post('/select', {
                sessionId: localStorage.getItem('sessionId'),
                answer: choiceId,
                cardId
            });

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

            let lastAnswers = getState().card.get('lastAnswers').toArray();

            let setId = localStorage.getItem('setId');
            let sessionId = localStorage.getItem('sessionId');

            if (!setId) {
                let response = await FetchService.post('/sets', {
                    sessionId
                });

                let sets = response.sets;
                if (sets.length === 0) {
                    // we don't have any set yet
                    dispatch(StateActions.onFinishLoading());
                    return;
                }

                setId = sets[0].id;
                localStorage.setItem('setId', setId);
            }

            const response = await FetchService.post('/card', {
                lastAnswers,
                sessionId,
                setId
            });

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

}