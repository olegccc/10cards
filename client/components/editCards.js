import React from 'react'
import {connect} from 'react-redux'
import { withRouter } from 'react-router'
import SubsetActions from '../actions/subset'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import RemoveCircleOutline from 'material-ui/svg-icons/content/remove-circle-outline'

class EditCards extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            subsetName: '',
            cards: [],
            filter: ''
        };

        this.getSubsets(props);
        this.getCards(props);
    }

    async getSubsets(props) {
        let subsets = await SubsetActions.getSubsets(props.setId);
        let subset = subsets.find(s => s.id === props.subsetId);
        this.setState({
            subsetName: subset.name
        });
    }

    async getCards(props) {
        let cards = await SubsetActions.getCards(props.subsetId);
        this.setState({
            cards
        });
    }

    async deleteCard(id) {
        await SubsetActions.deleteCard(id);
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
                <div className="item"><a href={'#/settings/set/'+this.props.setId+'/subset/'+this.props.subsetId}>{this.state.subsetName}</a></div>
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

    let {setId, subsetId} = props.routeParams;
    let sets = set.get('sets');

    let selectedSet = sets.find(set => set.id === setId) || {};

    return {
        selectedSet,
        setId,
        subsetId
    };
};

export default connect(mapStateToProps)(withRouter(EditCards));
