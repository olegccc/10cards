import React from 'react';
import {connect} from 'react-redux';

import Header from './header';
import Footer from './footer';

const Layout = ({ main }) =>
    (
        <div className="root">
            <div className="space"></div>
            <div className="center">
                <Header/>
                <div className="middle">
                    <div className="body">
                        {main}
                    </div>
                </div>
                <Footer/>
            </div>
            <div className="space"></div>
        </div>
    );

export default Layout;