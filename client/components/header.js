import React from 'react';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import {connect} from 'react-redux';
import { withRouter } from 'react-router';

class Header extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const {router} = this.props;

        function showHome() {
            router.push('/');
        }

        return (
            <div className="header">
                <Toolbar>
                    <ToolbarGroup>
                        <ToolbarTitle text="10 cards" onTouchTap={showHome} className="logo" />
                    </ToolbarGroup>
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
