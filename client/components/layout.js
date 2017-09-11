import React from 'react'
import Header from './header'

const Layout = ({ main }) =>
    (
        <div className="root">
            <div className="center">
                <Header/>
                <div className="middle">
                    <div className="body">
                        {main}
                    </div>
                </div>
            </div>
        </div>
    );

export default Layout;