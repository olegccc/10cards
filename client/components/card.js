import React from 'react';
import Choice from './choice'

export default ({items, source, comment, selectedAnswer, remainingTotal, remainingBlock}) => (<div className="card">
    <div className="source">{source}</div>
    <div className="comment">{comment}</div>
    {(remainingTotal || remainingBlock) ? <div className="statistics">
        <span>{remainingBlock} ({remainingTotal})</span>
    </div> : null}
    <div className="choices">
        {items && items.map((choice) => (<Choice key={choice.get('id')} readOnly={selectedAnswer !== null} {...choice.toObject()}></Choice>))}
    </div>
</div>);
