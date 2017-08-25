import React from 'react'
import {connect} from 'react-redux'
import { withRouter } from 'react-router'
import SubsetActions from '../actions/subset'
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

class EditSet extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            subsets: [],
            addNewSubset: false,
            newSubsetName: ''
        };

        this.initialize(props);
    }

    async initialize(props) {

        let subsets = await SubsetActions.getSubsets(props.routeParams.id);

        this.setState({
            subsets
        });
    }

    toggleCreateSubset() {
        this.setState({
            addNewSubset: !this.state.addNewSubset
        });
    }

    editSubset(id) {
        this.props.router.push('/settings/sets/' + id);
    }

    async createSubset() {

        let subsetName = this.state.newSubsetName;
        let setId = this.props.routeParams.id;

        this.setState({
            newSubsetName: '',
            addNewSubset: false
        });

        let insertedId = await SubsetActions.addSubset(setId, subsetName);

        this.props.router.push('/settings/set/' + setId + '/subset/' + insertedId);
    }

    renderBody() {
        return <div>
            <div className="breadcrumbs">
                <div className="item"><a href="#/settings">Settings</a></div>
                <div className="item">Edit set '{this.props.selectedSet.name}'</div>
            </div>
            <div className="section">Edit Subsets</div>

            <div>
                <p>
                    Note that if you define exactly two subsets they can be used together:
                    <ul>
                        <li>answer added to one subset can be
                            automatically added as question to second subset and vice versa</li>
                        <li>If you define also source and target languages you can get automatic translations</li>
                    </ul>
                </p>
            </div>

            <div className="list">
                {this.state.subsets.map(subset => (
                    <div className="item" key={subset.id}>
                        <a href={'#/settings/set/' + this.props.setId + '/subset/' + subset.id}>{subset.name}</a>
                    </div>
                ))}
                <div className="item"><a onTouchTap={() => this.toggleCreateSubset()}>Add new subset</a></div>
            </div>
            { this.state.addNewSubset ? <div className="new-set">
                <TextField
                    hintText="Name"
                    value={this.state.newSubsetName}
                    onChange={(event, value) => this.setState({ newSubsetName: value })}
                />
                <RaisedButton label="Add" primary={true} disabled={!this.state.newSubsetName} onTouchTap={() => this.createSubset()} />
            </div> : null }
        </div>;
    }

    render() {
        return (<div className="settings">{this.renderBody()}</div>);
    }
}

const mapStateToProps = ({set}, props) => {

    let setId = props.routeParams.id;
    let sets = set.get('sets');

    let selectedSet = sets.find(set => set.id === setId) || {};

    return {
        selectedSet,
        setId
    };
};

export default connect(mapStateToProps)(withRouter(EditSet));
