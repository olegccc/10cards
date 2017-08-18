import './styles/main.css';
import React from 'react';
import { render } from 'react-dom';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import { Provider } from 'react-redux';

import { createStore, applyMiddleware } from 'redux';
import reducers from './redux/index';

import Root from './components/root';

import injectTapEventPlugin from "react-tap-event-plugin";

injectTapEventPlugin();

const store = createStore(reducers, DEBUG ? applyMiddleware(thunk, createLogger()) : applyMiddleware(thunk));

render((
    <Provider store={store}>
        <Root/>
    </Provider>
), document.getElementById('app'));
