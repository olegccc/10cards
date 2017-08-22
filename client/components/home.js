import React from 'react'
import {connect} from 'react-redux'
import CardActions from '../actions/card'
import Card from './card'
import { withRouter } from 'react-router'
import RaisedButton from 'material-ui/RaisedButton';
import Answer from './answer'
import Authenticate from '../utils/authenticate'

class Home extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {

        if (this.props.loggedIn && !this.props.card.source) {
            this.props.dispatch(CardActions.getNext());
        }
    }

    login() {
        Authenticate.login(this.props.dispatch);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.loggedIn && !this.props.loggedIn && this.props.card && !this.props.card.source) {
            this.props.dispatch(CardActions.getNext());
        }
    }

    renderBody() {
        if (this.props.loginLoading) {
            return null;
        }

        if (!this.props.loggedIn) {
            return (<div>
                <p>You have not logged in. Please click Login button to start.</p>
                <div><RaisedButton label="Login with Facebook" primary={true} onTouchTap={() => this.login()}/></div>
            </div>);
        }

        if (this.props.card.correctAnswer) {
            return <Answer {...this.props.card} />;
        }

        return <Card {...this.props.card} />;
    }

    render() {
        return (<div className="home">{this.renderBody()}</div>);
    }
}

const mapStateToProps = ({card, state}) => {
    return {
        card: card.toObject(),
        loggedIn: state.get('loggedIn'),
        loginLoading: state.get('loginLoading')
    };
};

export default connect(mapStateToProps)(withRouter(Home));
