import React from 'react'
import {connect} from 'react-redux'
import { withRouter } from 'react-router'
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import SetActions from '../actions/set'

class Settings extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            addNewSet: false,
            newSetName: ''
        };
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
            <div className="section">Edit Sets</div>
            <div className="list">
                {this.props.sets.map(set => (
                    <div className="item" key={set.id}>
                        <a href={'#/settings/set/' + set.id}>{set.name}</a>
                    </div>
                ))}
                <div className="item"><a onTouchTap={() => this.toggleCreateSet()}>Add new set</a></div>
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
        sets: set.get('sets')
    };
};

export default connect(mapStateToProps)(withRouter(Settings));
