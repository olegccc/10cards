import React from 'react';
import {connect} from 'react-redux';
import SetActions from '../actions/set'
import Authenticate from '../utils/authenticate'

import Router from './router';

class Root extends React.Component {

    async componentDidMount() {

        let success = await Authenticate.start(this.props.dispatch);

        if (!success) {
            return;
        }

        this.props.dispatch(SetActions.refresh());
    }

    render() {

        return (
            <div className="router">
                {Router}
            </div>
        );
    }
}

export default connect()(Root);
