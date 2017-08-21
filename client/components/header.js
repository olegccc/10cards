import React from 'react';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import {connect} from 'react-redux';
import { withRouter } from 'react-router';

class Header extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const {router} = this.props;

        return (
            <div className="header">
                <Toolbar style={{ backgroundColor: 'white'}}>
                    <ToolbarGroup>
                        <ToolbarTitle text="10 cards" onTouchTap={() => router.push('/')} className="logo" />
                    </ToolbarGroup>
                    <IconButton color="contrast" aria-label="Menu" onTouchTap={() => router.push('/settings')}>
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </div>
        );
    }
}

const mapStateToProps = () => {
    return {
    };
};

export default connect(mapStateToProps)(withRouter(Header));
