import { Map, List } from 'immutable'
import CardActions from '../actions/card'

const defaultState = Map({
    items: [],
    source: '',
    comment: '',
    selectedAnswer: null,
    correctAnswer: null,
    cardId: null,
    lastAnswers: List()
});

function reducer(state = defaultState, action) {

    switch (action.type) {
        case CardActions.RESET_CARD:
            return state.merge({
                cardId: null,
                items: [],
                source: '',
                comment: '',
                correctAnswer: null,
                selectedAnswer: null
            });
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

            let lastAnswers = state.get('lastAnswers');

            if (lastAnswers.size >= 3) {
                lastAnswers = lastAnswers.shift();
            }

            return state.merge({
                correctAnswer: action.answerId,
                lastAnswers: lastAnswers.push(state.get('cardId'))
            });
    }

    return state;
}

export default reducer;
