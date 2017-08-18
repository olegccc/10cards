import { Map } from 'immutable'
import CartActions from '../actions/cart'

const defaultState = Map({
    items: [],
    source: '',
    comment: '',
    answer: null,
    answerValid: null,
    correctIndex: null
});

function reducer(state = defaultState, action) {

    switch (action.type) {
        case CartActions.SET_CART:
            return state.merge({
                items: action.items,
                source: action.source,
                comment: action.comment,
                answer: null,
                answerValid: null,
                correctIndex: action.correctIndex
            });
    }

    return state;
}

export default reducer;
