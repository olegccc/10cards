import React from 'react'
import {Router, Route, IndexRoute} from 'react-router'
import { hashHistory } from 'react-router'

import Home from './home'
import Settings from './settings'
import EditSet from './editSet'
import EditSubset from './editSubset'
import Layout from './layout'

const router = (
    <Router history={hashHistory}>
        <Route component={Layout}>
            <IndexRoute components={{main: Home}}/>
            <Route path="/" components={{main: Home}}/>
            <Route path="/settings" components={{main: Settings}}/>
            <Route path="/settings/set/:id" components={{main: EditSet}}/>
            <Route path="/settings/set/:setId/subset/:subsetId" components={{main: EditSubset}}/>
        </Route>
    </Router>);

export default router;
