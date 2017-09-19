import React from 'react'
import {connect} from 'react-redux'
import { withRouter } from 'react-router'
import Authenticate from '../utils/authenticate'
import Dashboard from './dashboard'
import ProgressBar from 'react-toolbox/lib/progress_bar';
import { Button } from 'react-toolbox/lib/button'

class Home extends React.Component {

    login() {
        Authenticate.login(this.props.dispatch);
    }

    renderBody() {

        let {loginLoading, loggedIn} = this.props;

        if (loginLoading) {
            return null;
        }

        if (!loggedIn) {
            return (<div style={{ marginTop: '6em'}}>
                <p>You are not logged in. Please click Login button to start.</p>
                <div>
                    <Button
                        raised
                        primary
                        style={{ fontSize: '1em', width: '100%' }}
                        label="Login with Facebook"
                        onTouchTap={() => this.login()}/>
                </div>
            </div>);
        }

        return <Dashboard/>;
    }

    render() {

        if (this.props.loading) {
            return <div className="loading">
                <div className="space"></div>
                <ProgressBar type="circular" mode="indeterminate" multicolor className="progress" />
                <div className="space"></div>
            </div>;
        }


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
