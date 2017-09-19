import React from 'react';
import CardActions from '../actions/card'
import {connect} from 'react-redux'

const Answer = ({items, source, comment, selectedAnswer, correctAnswer, dispatch}) => (
    <div className="answer" onTouchTap={() => dispatch(CardActions.getNext())}>
    <div className="source">{source}</div>
    <div className="comment">{comment}</div>
    <div className="choices">
        {items && items.map(item => {

            let type;
            let id = item.get('id');

            if (id === selectedAnswer) {
                if (selectedAnswer === correctAnswer) {
                    type = 'correct';
                } else {
                    type = 'incorrect'
                }
            } else if (id === correctAnswer) {
                type = 'correct';
            } else {
                type = 'regular';
            }

            let comment = item.get('comment');

            return <div key={id} className={ 'choice ' + type }>
                <div className="text">
                    <div className="space"></div>
                    <div>{item.get('text')}</div>
                    {comment ? <div className='comment'>{comment}</div> : null}
                    <div className="space"></div>
                </div>
            </div>;
        })}
    </div>
</div>);

export default connect()(Answer);
