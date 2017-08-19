import React from 'react';
import Choice from './choice'

export default ({items, source, comment, selectedAnswer}) => (<div className="card">
    <div className="source">{source}</div>
    <div className="comment">{comment}</div>
    <div className="choices">
        {items && items.map((choice) => (<Choice key={choice.get('id')} readOnly={selectedAnswer !== null} {...choice.toObject()}></Choice>))}
    </div>
</div>);
