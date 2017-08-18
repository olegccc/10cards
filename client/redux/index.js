import { combineReducers } from 'redux'
import state from './state'
import cart from './cart'

export default combineReducers({
    state,
    cart
});
