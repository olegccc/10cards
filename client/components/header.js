import React from 'react'
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar'
import IconButton from 'material-ui/IconButton'
import MenuIcon from 'material-ui/svg-icons/navigation/menu'
import {connect} from 'react-redux'
import { withRouter } from 'react-router'

class Header extends React.Component {

    render() {
        const {router} = this.props;

        return (
            <div className="header">
                <Toolbar style={{ backgroundColor: 'inherit'}}>
                    <ToolbarGroup>
                        <ToolbarTitle
                            text="10 cards"
                            onTouchTap={() => router.push('/')}
                            className="logo"/>
                    </ToolbarGroup>
                    {this.props.loggedIn ? <IconButton
                        iconStyle={{ width: '2em', height: '2em', color: 'rgba(0,0,0,0.4)' }}
                        style={{ width: '4em', height: '4em', padding: '1em', fontSize: '1em' }}
                        color="contrast"
                        aria-label="Menu"
                        onTouchTap={() => router.push('/settings')}>
                        <MenuIcon />
                    </IconButton> : null}
                </Toolbar>
                {this.props.error ? <div className="error">{this.props.error}</div> : null}
            </div>
        );
    }
}

const mapStateToProps = ({state}) => {
    return {
        error: state.get('error'),
        loggedIn: state.get('loggedIn')
    };
};

export default connect(mapStateToProps)(withRouter(Header));
