import React from 'react'
import {Router, Route, IndexRoute, hashHistory} from 'react-router'

import Home from './home'
import AddCard from './addCard'
import EditSet from './editSet'
import EditCards from './editCards'
import Layout from './layout'
import ManageSets from './manageSets'

const router = (
    <Router history={hashHistory}>
        <Route component={Layout}>
            <IndexRoute components={{main: Home}}/>
            <Route path="/" components={{main: Home}}/>
            <Route path="/addCard" components={{main: AddCard}}/>
            <Route path="/manageSets" components={{main: ManageSets}}/>
            <Route path="/editSet/:id/addCard" components={{main: AddCard}}/>
            <Route path="/editSet/:id" components={{main: EditSet}}/>
            <Route path="/editCards/:setId" components={{main: EditCards}}/>
            <Route path="/editCard/:cardId" components={{main: AddCard}}/>
        </Route>
    </Router>);

export default router;
