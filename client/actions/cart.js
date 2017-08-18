import FetchService from '../../shared/fetchService'

export default class Cart {

    static SET_CART = 'set_cart';

    static getNext() {

        return async dispatch => {

            const response = await FetchService.post('/choices', {
                sessionId: localStorage.getItem('sessionId')
            });

            dispatch({
                type: Cart.SET_CART,
                items: response.items,
                source: response.source,
                comment: response.comment,
                correctIndex: response.correctIndex
            });
        };

    }

}