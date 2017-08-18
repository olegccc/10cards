import React from 'react';
import {connect} from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Router from './router';

class Root extends React.Component {

    render() {

        return (
            <MuiThemeProvider>
                {Router}
            </MuiThemeProvider>
        );
    }
}

export default Root;
