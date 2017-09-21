import React from 'react'
import {connect} from 'react-redux'
import { withRouter } from 'react-router'
import { Button } from 'react-toolbox/lib/button'

const Header = ({router, error, loggedIn}) => {

    const isRoot = router.location.pathname === '/';

    return (
        <div className="header">
            <div className="logo">
                {!isRoot ? <Button icon='home' onTouchTap={() => router.push('/')}/> : null}
            </div>
            <div className="buttons">
                {loggedIn && isRoot ? <Button
                    icon='settings'
                    onTouchTap={() => router.push('/addCard')}>
                </Button> : null}
            </div>
            {error ? <div className="error">{error}</div> : null}
        </div>
    );
};

const mapStateToProps = ({state, set}) => {
    return {
        error: state.get('error'),
        loggedIn: state.get('loggedIn')
    };
};

export default connect(mapStateToProps)(withRouter(Header));
