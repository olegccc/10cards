import React from 'react'
import {connect} from 'react-redux'
import { withRouter } from 'react-router'
import SetActions from '../actions/set'
import { List, ListItem } from 'react-toolbox/lib/list';
import { Button, IconButton } from 'react-toolbox/lib/button'
import Input from 'react-toolbox/lib/input';
import CardActions from '../actions/card'

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
        this.props.dispatch(CardActions.reset());
    }

    async setActiveSet(event, set) {
        event.preventDefault();
        event.stopPropagation();
        await this.props.dispatch(SetActions.setCurrentSet(set.id));
        this.props.dispatch(SetActions.refresh());
        this.props.dispatch(CardActions.reset());
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
                            onClick={() => this.props.router.push('/editSet/' + set.id)}
                            rightIcon={ <IconButton onTouchTap={(event) => this.setActiveSet(event, set)} icon={set.active ? 'star' : 'crop_free'}/>}
                        >
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
        sets: set.get('sets') || []
    };
};

export default connect(mapStateToProps)(withRouter(Settings));
