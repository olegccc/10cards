import React from 'react'
import {Router, Route, IndexRoute} from 'react-router'
import { hashHistory } from 'react-router'

import Home from './home'
import Settings from './settings'
import EditSet from './editSet'
import EditCards from './editCards'
import Layout from './layout'

const router = (
    <Router history={hashHistory}>
        <Route component={Layout}>
            <IndexRoute components={{main: Home}}/>
            <Route path="/" components={{main: Home}}/>
            <Route path="/settings" components={{main: Settings}}/>
            <Route path="/settings/set/:id" components={{main: EditSet}}/>
            <Route path="/settings/set/:setId/cards" components={{main: EditCards}}/>
        </Route>
    </Router>);

export default router;
