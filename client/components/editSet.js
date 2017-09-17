import React from 'react'
import {connect} from 'react-redux'
import { withRouter } from 'react-router'
import BackendApi from '../utils/backendApi'
import { Button } from 'react-toolbox/lib/button'
import Input from 'react-toolbox/lib/input';

const isBlank = str => !str || /^\s*$/.test(str);

class EditSet extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            source: '',
            target: '',
            comment: '',
            statistics: null,
            settings: null
        };

        this.getStatistics();
        this.getSettings();
    }

    async getStatistics() {
        let statistics = await BackendApi.getSetStatistics(this.props.setId);
        this.setState({ statistics });
    }

    async getSettings() {
        let settings = await BackendApi.getSetSettings(this.props.setId);
        this.setState({ settings });
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

    async changeMode() {
        if (this.state.settings.simpleMode) {
            await BackendApi.setSetBlockMode(this.props.setId);
        } else {
            await BackendApi.setSetSimpleMode(this.props.setId);
        }
        await this.getSettings();
    }

    async startOver() {
        await BackendApi.startOver(this.props.setId);
        await this.getSettings();
    }

    async reset() {
        await BackendApi.reset(this.props.setId);
        await this.getSettings();
    }

    renderBody() {
        return <div className="settings">

            <div className="breadcrumbs">
                <div className="item"><a href="#/settings">Settings</a></div>
                <div className="item">Edit set '{this.props.selectedSet.name}'</div>
            </div>

            <h1>Edit set '{this.props.selectedSet.name}'</h1>

            <h2>Add Card</h2>

            <div>
                <Input
                    type="text"
                    label={<span style={{ fontSize: '0.8em' }}>Source</span>}
                    style={{ fontSize: '1em', width: '100%' }}
                    value={this.state.source}
                    onChange={value => this.setState({ source: value })}
                />
                <Input
                    type="text"
                    label={<span style={{ fontSize: '0.8em' }}>Target</span>}
                    style={{ fontSize: '1em', width: '100%' }}
                    value={this.state.target}
                    onChange={value => this.setState({ target: value })}
                />
                <Input
                    type="text"
                    label={<span style={{ fontSize: '0.8em' }}>Comment</span>}
                    style={{ fontSize: '1em', width: '100%' }}
                    value={this.state.comment}
                    onChange={value => this.setState({ comment: value })}
                />
                <Button
                    label="Add card"
                    primary
                    raised
                    disabled={isBlank(this.state.source) || isBlank(this.state.target)}
                    onTouchTap={() => this.addCard()}
                    style={{ fontSize: '1em', width: '100%' }}
                    />
            </div>

            <h2>Cards</h2>

            <Button
                label={'Edit Cards ' + (this.state.statistics ? (' (' + this.state.statistics.count + ')') : '')}
                raised
                onTouchTap={() => this.props.router.push('/settings/set/' + this.props.setId + '/cards')}
                style={{ fontSize: '1em', width: '100%' }}
            />

            {this.state.statistics && !this.state.statistics.count ? <div>
                <h2>Manage</h2>
                <Button
                    label="Delete set"
                    raised
                    onTouchTap={() => this.deleteSet()}
                    style={{ fontSize: '1em', width: '100%' }}
                    />

            </div> : null}

            <h2>Mode</h2>

            <div>
                <p style={{ fontSize: '0.5em'}}>The system can work in two modes: simple and regular mode. In simple mode you just take next card,
                    the process is the same each time. In blocks mode, you go round by round, each round includes only
                    unanswered cards (first round) or cards which were incorrectly answered in previous round.</p>
                <p style={{ fontSize: '0.5em'}}>Blocks mode can be also split in sub-blocks each of N cards. In this case you move to next sub-block
                    only after you answered correctly to each card in the sub-block.</p>
                { this.state.settings ? <p style={{ fontSize: '0.5em'}}>Current mode: {this.state.settings.simpleMode ? 'simple' : 'blocks'}.</p> : null }

                { this.state.settings ? <Button
                    label={ this.state.settings.simpleMode ? 'Switch to blocks mode' : 'Switch to simple mode'}
                    onTouchTap={() => this.changeMode()}
                    raised
                    style={{ fontSize: '1em', width: '100%', marginBottom: '1em' }}
                /> : null }

                { this.state.settings && !this.state.settings.simpleMode ? <Button
                    label='Start over'
                    onTouchTap={() => this.startOver()}
                    raised
                    style={{ fontSize: '1em', width: '100%', marginBottom: '1em' }}
                /> : null}

                <Button
                    label="Reset"
                    onTouchTap={() => this.reset()}
                    raised
                    style={{ fontSize: '1em', width: '100%' }}
                />
            </div>

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
