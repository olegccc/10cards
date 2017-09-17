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
            if (action.noSets) {
                cardState = CardState.NO_SETS;
            } else if (action.noCards) {
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
                state: cardState,
                cardTotal: action.cardTotal,
                remainingTotal: action.remainingTotal,
                cardBlock: action.cardBlock,
                remainingBlock: action.remainingBlock
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
