import React from 'react'
import {connect} from 'react-redux'
import { withRouter } from 'react-router'
import BackendApi from '../utils/backendApi'
import { Button } from 'react-toolbox/lib/button'

class EditSet extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
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
        this.props.router.push('/manageSets');
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
                <div className="item"><a href="#/manageSets">Sets</a></div>
                <div className="item">{this.props.selectedSet.name}</div>
            </div>

            <h1>Edit set</h1>

            <h2>Cards</h2>

            <Button
                label='Add card'
                raised
                onTouchTap={() => this.props.router.push('/editSet/' + this.props.setId + '/addCard')}
                style={{ fontSize: '1em', width: '100%' }}
            />

            <Button
                label={'Edit Cards ' + (this.state.statistics ? (' (' + this.state.statistics.count + ')') : '')}
                raised
                onTouchTap={() => this.props.router.push('/editCards/' + this.props.setId)}
                style={{ fontSize: '1em', width: '100%', marginTop: '0.5em' }}
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
