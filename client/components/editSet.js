import React from 'react'
import {connect} from 'react-redux'
import { withRouter } from 'react-router'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import BackendApi from '../utils/backendApi'

const isBlank = str => !str || /^\s*$/.test(str);

class EditSet extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            source: '',
            target: '',
            comment: '',
            statistics: null
        };

        this.initialize();
    }

    async initialize() {
        let statistics = await BackendApi.getSetStatistics(this.props.setId);
        this.setState({
            statistics
        });
    }

    async deleteSet() {

        await BackendApi.deleteSet(this.props.setId);

        this.props.router.push('/settings');
    }

    async addCard() {
        let { source, target, comment } = this.state;
        let { setId } = this.props;

        this.setState({
            source: '',
            target: '',
            comment: ''
        });

        await BackendApi.addCard(setId, source, target, comment);
    }

    renderBody() {
        return <div>
            <div className="breadcrumbs">
                <div className="item"><a href="#/settings">Settings</a></div>
                <div className="item">Edit set '{this.props.selectedSet.name}'</div>
            </div>

            <div className="section">Add Card</div>
            <div>
                <TextField
                    hintText="Source"
                    style={{fontSize: '3vh', height: '6vh'}}
                    hintStyle={{ bottom: '2vh'}}
                    value={this.state.source}
                    fullWidth={true}
                    onChange={(event, value) => this.setState({ source: value })}
                />
                <TextField
                    hintText="Target"
                    style={{fontSize: '3vh', height: '6vh'}}
                    hintStyle={{ bottom: '2vh'}}
                    value={this.state.target}
                    fullWidth={true}
                    onChange={(event, value) => this.setState({ target: value })}
                />
                <TextField
                    hintText="Comment"
                    style={{fontSize: '3vh', height: '6vh'}}
                    hintStyle={{ bottom: '2vh'}}
                    value={this.state.comment}
                    fullWidth={true}
                    onChange={(event, value) => this.setState({ comment: value })}
                />
                <RaisedButton
                    label="Add card"
                    primary={true}
                    disabled={isBlank(this.state.source) || isBlank(this.state.target)}
                    onTouchTap={() => this.addCard()}
                    labelStyle={{fontSize: '1em'}}
                    buttonStyle={{height: '2em', marginTop: '0.5em'}}
                    fullWidth={true} />
            </div>

            <div className="section">Cards</div>

            <div><a href={ '#/settings/set/' + this.props.setId + '/cards'} >Edit Cards{ this.state.statistics ? (' (' + this.state.statistics.count + ')') : ''}</a></div>

            {this.state.statistics && !this.state.statistics.count ? <div>
                <div className="section">Manage</div>
                <RaisedButton
                    label="Delete set"
                    onTouchTap={() => this.deleteSet()}
                    labelStyle={{fontSize: '1em'}}
                    buttonStyle={{height: '2em', marginTop: '0.5em'}}
                    fullWidth={true} />

            </div> : null}

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
