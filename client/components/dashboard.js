import React from 'react'
import {connect} from 'react-redux'
import CardActions from '../actions/card'
import Card from './card'
import { withRouter } from 'react-router'
import Answer from './answer'

class Dashboard extends React.Component {

    componentDidMount() {
        if (this.props.loggedIn && !this.props.card.cardId) {
            this.props.dispatch(CardActions.getNext());
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.loggedIn && !this.props.loggedIn) {
            this.props.dispatch(CardActions.getNext());
        }
    }

    render() {

        if (this.props.card.cardId === -1) {
            return <div style={{ marginTop: '2em'}}>
                <p>There are no cards defined. Please add cards in <a href="/#/settings">settings</a>.</p>
            </div>
        }


        return this.props.card.correctAnswer ? <Answer {...this.props.card} /> : <Card {...this.props.card} />;
    }
}

const mapStateToProps = ({card, state}) => {
    return {
        card: card.toObject(),
        loggedIn: state.get('loggedIn')
    };
};

export default connect(mapStateToProps)(withRouter(Dashboard));
