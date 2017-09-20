import React from 'react'
import {connect} from 'react-redux'
import { withRouter } from 'react-router'
import { Button } from 'react-toolbox/lib/button'

class Header extends React.Component {

    gotoSettings() {
        const {sets, router} = this.props;
        if (sets && sets.length > 0) {
            router.push('/addCard');
        } else {
            router.push('/manageSets');
        }
    }

    render() {
        const {router} = this.props;

        const isRoot = this.props.router.location.pathname === '/';

        return (
            <div className="header">
                <div className="logo">
                    {!isRoot ? <Button icon='home' onTouchTap={() => router.push('/')}/> : null}
                </div>
                <div className="buttons">
                    {this.props.loggedIn && isRoot ? <Button
                        icon='settings'
                        onTouchTap={() => this.gotoSettings()}>
                    </Button> : null}
                </div>
                {this.props.error ? <div className="error">{this.props.error}</div> : null}
            </div>
        );
    }
}

const mapStateToProps = ({state, set}) => {
    return {
        sets: set.get('sets'),
        error: state.get('error'),
        loggedIn: state.get('loggedIn')
    };
};

export default connect(mapStateToProps)(withRouter(Header));
