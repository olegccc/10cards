import React from 'react';
import CardActions from '../actions/card'
import {connect} from 'react-redux'

const Choice = ({text, id, readOnly, dispatch}) =>
    (<div className={'choice ' + (readOnly ? 'read-only' : '')} onTouchTap={() => dispatch(CardActions.setChoice(id))}>
        <div className="text">
            <div className="space"></div>
            <div>{text}</div>
            <div className="space"></div>
        </div>
    </div>);

export default connect()(Choice);
