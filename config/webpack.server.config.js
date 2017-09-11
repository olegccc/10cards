const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

const projectPath = path.join(__dirname, '..');

module.exports = (grunt, module, release) => {

    var sourcePath = path.join(projectPath, module);
    var buildPath = path.join(projectPath, release ? 'release' : 'debug');
    var index = './' + module + '/' + module + '.js';

    if (!release) {
        buildPath = path.join(buildPath, module);
    }

    let ret = {
        entry: [
            'babel-regenerator-runtime',
            index
        ],
        watch: true,
        output: {
            path: buildPath,
            filename: module + '.js',
            library: 'Server',
            libraryTarget: 'commonjs2'
        },
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    //include: sourcePath,
                    loader: 'babel-loader',
                    query: {
                        compact: true,
                        plugins: [],
                        presets: ['es2015', 'stage-0']
                    }
                },
                {
                    test: /\.json$/,
                    loader: 'json-loader'
                }
            ]
        },
        target: 'node',
        node: {
            __dirname: false,
            __filename: false
        },
        externals: [nodeExternals()],
        stats: {
            modules: false,
            reasons: false,
            colors: true,
            chunks: false,
            hash: false,
            timings: false,
            version: false,
            children: false,
            assets: false
        },
        plugins: [
            new webpack.DefinePlugin({
                $dirname: '__dirname',
            })
        ]
    };

    if (release) {
        ret.plugins.push(new webpack.optimize.UglifyJsPlugin({
            sourceMap: false,
            mangle: true
        }));
    } else {
        ret.plugins.push(new webpack.LoaderOptionsPlugin({
            debug: true
        }));
        ret.devtool = 'source-map';
    }

    return ret;
};
