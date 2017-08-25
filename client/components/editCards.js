import React from 'react'
import {connect} from 'react-redux'
import { withRouter } from 'react-router'
import TextField from 'material-ui/TextField'
import IconButton from 'material-ui/IconButton'
import RemoveCircleOutline from 'material-ui/svg-icons/content/remove-circle-outline'
import BackendApi from '../utils/backendApi'

class EditCards extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            cards: [],
            filter: ''
        };

        this.getCards(props);
    }

    async getCards(props) {
        let cards = await BackendApi.getCards(props.setId);
        this.setState({
            cards
        });
    }

    async deleteCard(id) {
        await BackendApi.deleteCard(id);
        await this.getCards(this.props);
    }

    renderBody() {

        let cards = this.state.cards;

        if (this.state.filter) {
            let filter = this.state.filter.toLowerCase();
            cards = cards.filter(card => card.source.toLowerCase().includes(filter) ||
                card.target.toLowerCase().includes(filter) ||
                card.comment.toLowerCase().includes(filter));
        }

        return <div>
            <div className="breadcrumbs">
                <div className="item"><a href="#/settings">Settings</a></div>
                <div className="item"><a href={'#/settings/set/'+this.props.selectedSet.id}>{this.props.selectedSet.name}</a></div>
                <div className="item">Edit Cards</div>
            </div>
            <div className="section">Edit Cards</div>
            <div className="filter">
                <TextField
                    hintText="Apply filter"
                    style={{fontSize: '3vh', height: '6vh'}}
                    value={this.state.filter}
                    fullWidth={true}
                    onChange={(event, value) => this.setState({filter: value})}
                />
            </div>
            <div className="cards">
                <div className="record-header">
                    <div className="column">Source</div>
                    <div className="column">Target</div>
                    <div className="column">Comment</div>
                    <div className="actions"></div>
                </div>
                {cards.map(card => (<div className="record" key={card.id}>
                    <div className="column">{card.source}</div>
                    <div className="column">{card.target}</div>
                    <div className="column">{card.comment}</div>
                    <div className="actions">
                        <IconButton tooltip="Remove Card" touch={true} tooltipPosition="bottom-left" onTouchTap={() => this.deleteCard(card.id)}>
                            <RemoveCircleOutline />
                        </IconButton>
                    </div>
                </div>))}
            </div>
            <div className="paging">

            </div>
        </div>;
    }

    render() {
        return (<div className="settings">{this.renderBody()}</div>);
    }
}

const mapStateToProps = ({set}, props) => {

    let {setId} = props.routeParams;
    let sets = set.get('sets');

    let selectedSet = sets.find(set => set.id === setId) || {};

    return {
        selectedSet,
        setId
    };
};

export default connect(mapStateToProps)(withRouter(EditCards));
