import React from 'react';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import {connect} from 'react-redux';
import { withRouter } from 'react-router';

class Header extends React.Component {

    render() {
        const {router} = this.props;

        return (
            <div className="header">
                <Toolbar style={{ backgroundColor: 'white'}}>
                    <ToolbarGroup>
                        <ToolbarTitle
                            text="10 cards"
                            onTouchTap={() => router.push('/')}
                            className="logo"/>
                    </ToolbarGroup>
                    <IconButton color="contrast" aria-label="Menu" onTouchTap={() => router.push('/settings')}>
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
                {this.props.error ? <div className="error">{this.props.error}</div> : null}
            </div>
        );
    }
}

const mapStateToProps = ({state}) => {
    return {
        error: state.get('error')
    };
};

export default connect(mapStateToProps)(withRouter(Header));
