import React from 'react'
import {connect} from 'react-redux'
import { withRouter } from 'react-router'
import { Button } from 'react-toolbox/lib/button'

class Header extends React.Component {

    render() {
        const {router} = this.props;

        return (
            <div className="header">
                <div className="logo" onTouchTap={() => router.push('/')}>10 cards</div>
                <div className="buttons">
                    {this.props.loggedIn ? <Button
                        icon='menu'
                        onTouchTap={() => router.push('/settings')}>
                    </Button> : null}
                </div>
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
