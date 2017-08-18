import React from 'react';
import Choice from './choice'

export default ({items, source, comment}) => (<div className="cart">
    <div className="source">{source}</div>
    <div className="comment">{comment}</div>
    {items && items.map((choice, idx) => (<Choice key={idx} {...choice.toObject()}></Choice>))}
</div>);
