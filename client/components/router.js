import React from 'react'
import {Router, Route, IndexRoute} from 'react-router'
import { hashHistory } from 'react-router'

import Home from './home';
import Layout from './layout';

const router = (
    <Router history={hashHistory}>
        <Route component={Layout}>
            <IndexRoute components={{main: Home}}/>
            <Route path="/" components={{main: Home}}/>
            <Route path="/observe/:sessionId" components={{main: Home}}/>
        </Route>
    </Router>);

export default router;
