import React from 'react'
import {connect} from 'react-redux'
import CartActions from '../actions/cart'
import Cart from './cart'
import { withRouter } from 'react-router'
import RaisedButton from 'material-ui/RaisedButton';
import Authenticate from '../utils/authenticate'

class Home extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    async componentDidMount() {

        let success = await Authenticate.start(this.props.dispatch);

        if (!success) {
            return;
        }

        this.props.dispatch(CartActions.getNext());
    }

    login() {
        FacebookInit.login(this.props.dispatch);
    }

    render() {

        if (this.props.loginLoading) {
            return null;
        }

        if (!this.props.loggedIn) {
            return (<div className="home">
                <p>You have not logged in. Please click Login button to start.</p>
                <div><RaisedButton label="Login with Facebook" primary={true} onTouchTap={() => this.login()}/></div>
            </div>);
        }

        return (<div className="home" style={{ paddingTop: '1em' }}>
                <Cart {...this.props.cart} />
            </div>
        );
    }
}

const mapStateToProps = ({cart, state}) => {
    return {
        cart: cart.toObject(),
        loggedIn: state.get('loggedIn'),
        loginLoading: state.get('loginLoading')
    };
};

export default connect(mapStateToProps)(withRouter(Home));
