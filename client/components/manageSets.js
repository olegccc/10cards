import React from 'react'
import {connect} from 'react-redux'
import { withRouter } from 'react-router'
import SetActions from '../actions/set'
import { List, ListItem, ListSubHeader } from 'react-toolbox/lib/list';
import { Button, IconButton } from 'react-toolbox/lib/button'
import Input from 'react-toolbox/lib/input';

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
        this.props.router.push('/editSet/' + insertedId);
    }

    render() {

        return <div className="settings">
            <h1>Sets</h1>
            <div className="list">
                <List selectable ripple>
                    {this.props.sets.map(set => (
                        <ListItem
                            caption={set.name}
                            key={set.id}
                            rightIcon={ set.id === this.props.setId ? <IconButton onTouchTap={() => this.props.dispatch(SetActions.setCurrentSet(set.id))} icon='star'/> : null}
                            onClick={() => this.props.router.push('/editSet/' + set.id)}>
                        </ListItem>
                    ))}
                    <ListItem onClick={() => this.toggleCreateSet()} caption="Add new set"/>
                </List>
            </div>
            { this.state.addNewSet ? <div className="new-set">
                <Input
                    type='text'
                    label={<span style={{ fontSize: '0.8em' }}>Name</span>}
                    value={this.state.newSetName}
                    style={{ width: 'inherit' }}
                    onChange={(value) => this.setState({ newSetName: value })} />
                <Button
                    label='Add'
                    style={{ fontSize: '1em' }}
                    primary
                    raised
                    disabled={!this.state.newSetName}
                    onTouchTap={() => this.createSet()} />
            </div> : null }
        </div>;
    }
}

const mapStateToProps = ({set}) => {
    return {
        sets: set.get('sets') || [],
        setId: set.get('setId')
    };
};

export default connect(mapStateToProps)(withRouter(Settings));
