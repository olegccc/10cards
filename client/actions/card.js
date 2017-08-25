import StateActions from '../actions/state'
import Configuration from '../utils/configuration'
import BackendApi from '../utils/backendApi'

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

            let lastAnswers = getState().card.get('lastAnswers').toArray();

            let setId = Configuration.getSetId();

            if (!setId) {
                let sets = await BackendApi.getSets();

                if (sets.length === 0) {
                    // we don't have any set yet
                    dispatch(StateActions.onFinishLoading());
                    dispatch(StateActions.onError('No card set is defined, nothing to load'));
                    return;
                }

                setId = sets[0].id;
                Configuration.setSetId(setId);
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

}