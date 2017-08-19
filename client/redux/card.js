import { Map } from 'immutable'
import CardActions from '../actions/card'

const defaultState = Map({
    items: [],
    source: '',
    comment: '',
    selectedAnswer: null,
    correctAnswer: null,
    cardId: null,
});

function reducer(state = defaultState, action) {

    switch (action.type) {
        case CardActions.SET_CARD:
            return state.merge({
                cardId: action.cardId,
                items: action.items,
                source: action.source,
                comment: action.comment,
                correctAnswer: null,
                selectedAnswer: null
            });
        case CardActions.SET_CHOICE:
            return state.merge({
                selectedAnswer: action.answer
            });
        case CardActions.SET_ANSWER:
            return state.merge({
                correctAnswer: action.answerId
            });
    }

    return state;
}

export default reducer;
