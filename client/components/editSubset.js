import React from 'react'
import {connect} from 'react-redux'
import { withRouter } from 'react-router'
import SubsetActions from '../actions/subset'
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

class EditSubset extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            subsetName: '',
            source: '',
            target: '',
            comment: ''
        };
        this.initialize(props);
    }

    async initialize(props) {
        let subsets = await SubsetActions.getSubsets(props.setId);
        let subset = subsets.find(s => s.id === props.subsetId);
        this.setState({
            subsetName: subset.name
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
                    floatingLabelText="Original"
                    value={this.state.source}
                    fullWidth={true}
                    onChange={(event, value) => this.setState({ source: value })}
                />
                <TextField
                    hintText="Translated text"
                    floatingLabelText="Translation"
                    value={this.state.target}
                    fullWidth={true}
                    onChange={(event, value) => this.setState({ target: value })}
                />
                <TextField
                    hintText="Additional explanation"
                    floatingLabelText="Comment"
                    value={this.state.comment}
                    fullWidth={true}
                    onChange={(event, value) => this.setState({ comment: value })}
                />
                <RaisedButton label="Add card" primary={true} disabled={!this.state.source || !this.state.target} onTouchTap={() => this.addCard()} fullWidth={true} />
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

export default connect(mapStateToProps)(withRouter(EditSubset));
