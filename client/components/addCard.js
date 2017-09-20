import React from 'react'
import {connect} from 'react-redux'
import { withRouter } from 'react-router'
import BackendApi from '../utils/backendApi'
import { Button } from 'react-toolbox/lib/button'
import Input from 'react-toolbox/lib/input';
import _ from 'lodash'
import SetActions from '../actions/set'

const isBlank = str => !str || /^\s*$/.test(str);

const properties = [
    {
        name: 'source',
        label: 'Source',
        required: true
    },
    {
        name: 'target',
        label: 'Target',
        required: true
    },
    {
        name: 'sourceComment',
        label: 'Source comment'
    },
    {
        name: 'targetComment',
        label: 'Target comment'
    },
    {
        name: 'answers',
        label: 'Answers (optional, <=5, line delim.)',
        multiLine: true
    }
];

class AddCard extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            count: null,
            enabled: true
        };

        for (let property of properties) {
            this.state[property.name] = '';
        }

        this.getStatistics();

        if (this.props.routeParams.cardId) {
            this.readCard();
        }

        if (!props.sets && props.selectedSet) {
            props.dispatch(SetActions.refresh());
        }
    }

    async readCard() {
        let card = await BackendApi.readCard(this.props.routeParams.cardId);

        let state = {};

        for (let property of properties) {
            if (property.multiLine) {
                let value = card[property.name];
                if (_.isArray(value)) {
                    state[property.name] = value.join('\n');
                }
            } else {
                state[property.name] = card[property.name] || '';
            }
        }

        this.setState(state);
    }

    async getStatistics() {

        let statistics = await BackendApi.getSetStatistics(this.props.setId);
        this.setState({ count: statistics.count });
    }

    async addCard() {

        this.setState({
            enabled: false,
            error: ''
        });

        let {cardId} = this.props.routeParams;

        try {
            let options = {};
            let {setId} = this.props;

            let state = {};

            for (let property of properties) {
                options[property.name] = this.state[property.name];
                state[property.name] = '';

                if (property.multiLine) {
                    options[property.name] = _.compact(options[property.name].split('\n'));
                }
            }

            if (cardId) {
                await BackendApi.editCard(cardId, options);
                this.props.router.goBack();
                return;
            }

            let response = await BackendApi.addCard(setId, options);

            state.count = response.count;

            state.enabled = true;

            this.setState(state);

        } catch(error) {
            console.log(error.error);
            this.setState({
                enabled: true,
                error: error.error
            });
        }
    }

    render() {

        let {selectedSet} = this.props;
        let {cardId} = this.props.routeParams;
        let {count, enabled, error} = this.state;

        let isValid = true;

        for (let property of properties) {
            if (property.required && isBlank(this.state[property.name])) {
                isValid = false;
                break;
            }
        }

        return <div className="settings">

            {selectedSet ? <div>
                <div className="breadcrumbs">
                    <div className="item"><a href="#/manageSets">Sets</a></div>
                    <div className="item"><a href={'#/settings/set/'+selectedSet.id}>{selectedSet.name}</a></div>
                    <div className="item">Add card</div>
                </div>

            </div>:<div>
                {cardId ? null : <div className="side-links">
                    <a href="#/manageSets">Manage sets</a>
                </div>}
            </div>}

            <h1>{cardId ? 'Edit card' : 'Add card'}</h1>

            {count !== null ? <p>
                Card count: {count}
            </p> : null}

            {properties.map(property =>
                <Input
                    key={property.name}
                    disabled={!enabled}
                    type="text"
                    label={<span style={{ fontSize: '0.8em' }}>{property.label}</span>}
                    value={this.state[property.name]}
                    onChange={value => this.setState({ [property.name]: value })}
                    multiline={property.multiLine}
                />)}

            {error ? <p className='error'>{error}</p> : null}

            <Button
                label={cardId ? 'Save card' : 'Add card'}
                primary
                raised
                disabled={!isValid || !enabled}
                onTouchTap={() => this.addCard()}
                style={{ fontSize: '1em', width: '100%' }}
            />

        </div>;
    }
}

const mapStateToProps = ({set}, props) => {

    let setId = props.routeParams.id;
    let selectedSet;
    let sets = set.get('sets');

    if (setId) {
        selectedSet = (sets && sets.find(set => set.id === setId)) || {};
    }

    return {
        selectedSet,
        setId,
        sets
    };
};

export default connect(mapStateToProps)(withRouter(AddCard));
