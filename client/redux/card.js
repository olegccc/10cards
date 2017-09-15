import { Map, List } from 'immutable'
import CardActions from '../actions/card'
import CardState from './cardState'

const defaultState = Map({
    items: [],
    source: '',
    comment: '',
    selectedAnswer: null,
    correctAnswer: null,
    cardId: null,
    lastAnswers: List(),
    state: CardState.DEFAULT
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
                selectedAnswer: null,
                state: CardState.DEFAULT
            });

        case CardActions.SET_CARD:

            let cardState = CardState.DEFAULT;
            if (action.noCards) {
                cardState = CardState.NO_CARDS;
            } else if (action.allCorrect) {
                cardState = CardState.ALL_CORRECT;
            } else if (action.allAnswered) {
                cardState = CardState.ALL_ANSWERED;
            }

            return state.merge({
                cardId: action.id,
                items: action.items,
                source: action.source,
                comment: action.comment,
                correctAnswer: null,
                selectedAnswer: null,
                state: cardState
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
