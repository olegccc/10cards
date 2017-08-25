import React from 'react'
import {connect} from 'react-redux'
import { withRouter } from 'react-router'
import RaisedButton from 'material-ui/RaisedButton';
import Authenticate from '../utils/authenticate'
import CircularProgress from 'material-ui/CircularProgress';
import Dashboard from './dashboard'

class Home extends React.Component {

    login() {
        Authenticate.login(this.props.dispatch);
    }

    renderBody() {

        if (this.props.loading) {
            return <div className="loading">
                <div className="space"></div>
                <CircularProgress size={100} thickness={7} />
                <div className="space"></div>
            </div>;
        }

        if (this.props.loginLoading) {
            return null;
        }

        if (!this.props.loggedIn) {
            return (<div>
                <p>You have not logged in. Please click Login button to start.</p>
                <div>
                    <RaisedButton
                        labelStyle={{ fontSize: '1em'}}
                        buttonStyle={{ height: '2em'}}
                        label="Login with Facebook"
                        primary={true}
                        onTouchTap={() => this.login()}/>
                </div>
            </div>);
        }

        return <Dashboard/>;
    }

    render() {
        return (<div className="home">{this.renderBody()}</div>);
    }
}

const mapStateToProps = ({state}) => {
    return {
        loggedIn: state.get('loggedIn'),
        loginLoading: state.get('loginLoading'),
        loading: state.get('loading')
    };
};

export default connect(mapStateToProps)(withRouter(Home));
