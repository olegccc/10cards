import { combineReducers } from 'redux'
import state from './state'
import card from './card'
import set from './set'

export default combineReducers({
    state,
    card,
    set
});
