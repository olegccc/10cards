import React from 'react'
import {connect} from 'react-redux'
import { withRouter } from 'react-router'
import SubsetActions from '../actions/subset'
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox'

class EditSubset extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            subsetName: '',
            source: '',
            target: '',
            comment: '',
            addOpposite: false
        };
        this.initialize(props);
    }

    async initialize(props) {
        let subsets = await SubsetActions.getSubsets(props.setId);
        let subset = subsets.find(s => s.id === props.subsetId);
        this.setState({
            subsetName: subset.name,
            oppositeSubsetId: subsets.length === 2 && subsets.find(s => s.id !== props.subsetId).id
        });
    }

    async addCard() {
        let { source, target, comment } = this.state;
        let { setId, subsetId } = this.props;

        this.setState({
            source: '',
            target: '',
            comment: ''
        });

        await SubsetActions.addCard(setId, subsetId, source, target, comment);

        if (this.state.oppositeSubsetId && this.state.addOpposite) {
            await SubsetActions.addCard(setId, this.state.oppositeSubsetId, target, source, comment);
        }
    }

    renderBody() {
        return <div>
            <div className="breadcrumbs">
                <div className="item"><a href="#/settings">Settings</a></div>
                <div className="item"><a href={'#/settings/set/'+this.props.selectedSet.id}>{this.props.selectedSet.name}</a></div>
                <div className="item">Edit subset '{this.state.subsetName}'</div>
            </div>
            <div className="section">Add Card</div>
            <div>
                <TextField
                    hintText="Original text"
                    style={{fontSize: '3vh', height: '6vh'}}
                    hintStyle={{ bottom: '2vh'}}
                    value={this.state.source}
                    fullWidth={true}
                    onChange={(event, value) => this.setState({ source: value })}
                />
                <TextField
                    hintText="Translated text"
                    style={{fontSize: '3vh', height: '6vh'}}
                    hintStyle={{ bottom: '2vh'}}
                    value={this.state.target}
                    fullWidth={true}
                    onChange={(event, value) => this.setState({ target: value })}
                />
                <TextField
                    hintText="Additional explanation"
                    style={{fontSize: '3vh', height: '6vh'}}
                    hintStyle={{ bottom: '2vh'}}
                    value={this.state.comment}
                    fullWidth={true}
                    onChange={(event, value) => this.setState({ comment: value })}
                />
                {this.state.oppositeSubsetId ? <div style={{ margin: '1em 0'}}><Checkbox
                    label="Add to opposite subset?"
                    checked={this.state.addOpposite}
                    onCheck={() => this.setState({ addOpposite: !this.state.addOpposite })}
                /></div> : null}
                <RaisedButton
                    label="Add card"
                    primary={true}
                    disabled={!this.state.source || !this.state.target}
                    onTouchTap={() => this.addCard()}
                    labelStyle={{fontSize: '3vh'}}
                    buttonStyle={{height: '5vh'}}
                    fullWidth={true} />
            </div>

            <div className="section">Cards</div>

            <div><a href={ '#/settings/set/' + this.props.setId + '/subset/' + this.props.subsetId + '/cards'} >Edit Cards</a></div>
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

export default connect(mapStateToProps)(withRouter(EditSubset));
