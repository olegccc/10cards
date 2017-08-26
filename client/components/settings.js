import React from 'react'
import {connect} from 'react-redux'
import { withRouter } from 'react-router'
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import SetActions from '../actions/set'
import RadioButtonChecked from 'material-ui/svg-icons/toggle/radio-button-checked'
import RadioButtonUnchecked from 'material-ui/svg-icons/toggle/radio-button-unchecked'
import IconButton from 'material-ui/IconButton'
import Configuration from "../utils/configuration";

class Settings extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            addNewSet: false,
            newSetName: ''
        };

        props.dispatch(SetActions.refresh());
    }

    toggleCreateSet() {
        this.setState({
            addNewSet: !this.state.addNewSet
        });
    }

    async createSet() {
        let setName = this.state.newSetName;
        this.setState({
            newSetName: '',
            addNewSet: false
        });
        let insertedId = await this.props.dispatch(SetActions.addNewSet(setName));
        this.props.router.push('/settings/set/' + insertedId);
    }

    renderBody() {

        return <div>
            <div className="section">Sets</div>
            <div className="list">
                {this.props.sets.map(set => (
                    <div className="item" key={set.id}>
                        <IconButton>
                            { set.id === this.props.setId ? <RadioButtonChecked/> : <RadioButtonUnchecked
                                onTouchTap={() => this.props.dispatch(SetActions.setCurrentSet(set.id))} /> }
                        </IconButton>
                        <a href={'#/settings/set/' + set.id}>{set.name}</a>
                    </div>
                ))}
                <div className="item" style={{ marginTop: '0.5em'}}><a onTouchTap={() => this.toggleCreateSet()}>Add new set</a></div>
            </div>
            { this.state.addNewSet ? <div className="new-set">
                <TextField
                    hintText="Name"
                    value={this.state.newSetName}
                    onChange={(event, value) => this.setState({ newSetName: value })}
                />
                <RaisedButton label="Add" primary={true} disabled={!this.state.newSetName} onTouchTap={() => this.createSet()} />
            </div> : null }
        </div>;
    }

    render() {
        return (<div className="settings">{this.renderBody()}</div>);
    }
}

const mapStateToProps = ({set}) => {
    return {
        sets: set.get('sets'),
        setId: set.get('setId')
    };
};

export default connect(mapStateToProps)(withRouter(Settings));
