import React from 'react'
import {connect} from 'react-redux'
import CardActions from '../actions/card'
import Card from './card'
import { withRouter } from 'react-router'
import Answer from './answer'
import CardState from '../redux/cardState'
import { Button } from 'react-toolbox/lib/button'

class Dashboard extends React.Component {

    componentDidMount() {
        if (this.props.loggedIn && !this.props.card.cardId && (!this.props.card.state || this.props.card.state === CardState.DEFAULT)) {
            this.props.dispatch(CardActions.getNext());
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.loggedIn && !this.props.loggedIn && (!this.props.card.state || this.props.card.state === CardState.DEFAULT)) {
            this.props.dispatch(CardActions.getNext());
        }
    }

    startOver() {
        this.props.dispatch(CardActions.startOver(true));
    }

    answerIncorrect() {
        this.props.dispatch(CardActions.answerIncorrect());
    }

    render() {

        let {cardId, correctAnswer, state} = this.props.card;

        let message;

        switch (state) {
            case CardState.NO_SETS:
                message = <p>There are no card sets defined. Please create set <a href="/#/manageSets">here</a>.</p>;
                break;
            case CardState.NO_CARDS:
                message = <p>There are no cards defined. Please add cards <a href="/#/addCard">here</a>.</p>;
                break;
            case CardState.ALL_CORRECT:
                message = <div><p>You gave all correct answers.</p><Button
                    label='Start over'
                    onTouchTap={() => this.startOver()}
                    raised
                    primary
                    style={{ fontSize: '1em', width: '100%' }}
                /></div>;
                break;
            case CardState.ALL_ANSWERED:
                message = <div><p>You gave all answers, but some were incorrect. You can answer again only incorrect ones or start over.</p>
                    <Button
                    label='Answer again'
                    onTouchTap={() => this.answerIncorrect()}
                    raised
                    primary
                    style={{ fontSize: '1em', width: '100%' }}
                /><Button
                        label='Start over'
                        onTouchTap={() => this.startOver()}
                        raised
                        style={{ fontSize: '1em', width: '100%', marginTop: '0.5em' }}
                    /></div>;
                break;
        }

        if (message) {
            return <div style={{ marginTop: '2em'}}>
                {message}
            </div>
        }


        return correctAnswer ? <Answer {...this.props.card} /> : <Card {...this.props.card} />;
    }
}

const mapStateToProps = ({card, state}) => {
    return {
        card: card.toObject(),
        loggedIn: state.get('loggedIn')
    };
};

export default connect(mapStateToProps)(withRouter(Dashboard));
