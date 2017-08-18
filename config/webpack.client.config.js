var config = require('../config/config');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
var path = require('path');
var autoprefixer = require('autoprefixer');
var precss = require('precss');
var postcssImport = require('postcss-import');
var fontMagician = require('postcss-font-magician');
var colorGuard = require('colorguard');

var projectPath = path.join(__dirname, '..');

module.exports = function (grunt, module, release) {

    var sourcePath = [
        path.join(projectPath, module),
        path.join(projectPath, 'shared')
    ];

    var buildPath = path.join(projectPath, release ? 'release' : 'debug');

    var entries = [
        'babel-regenerator-runtime',
        'whatwg-fetch'
    ];

    entries.push('./' + module + '/' + module);

    var ret = {
        entry: {
            main: entries
        },
        output: {
            path: buildPath,
            filename: module + '.js'
        },
        module: {
            loaders: [
                {
                    test: /\.jsx?$/,
                    include: sourcePath,
                    loader: 'babel',
                    query: {
                        presets: ['react', 'es2015', 'stage-0']
                    }
                },
                {
                    test: /\.css$/,
                    include: sourcePath,
                    loaders: ["style", "css", "postcss"]
                },
                {
                    test: /\.png$/,
                    loader: 'file-loader?name=[name].[ext]'
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: module + '/' + module + '.html',
                inject: false,
                filename: module + '.html'
            })
        ],
        stats: {
            modules: false,
            reasons: false,
            chunks: false,
            hash: false,
            timings: false,
            version: false,
            children: false,
            assets: false,
            colors: true
        },
        postcss: function(webpack) {
            return [
                autoprefixer({ browsers: ['last 2 versions'] }),
                postcssImport({
                    addDependencyTo: webpack
                }),
                precss,
                colorGuard,
                fontMagician
            ];
        }
    };

    ret.plugins.push(new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify(release ? 'production' : 'debug')
        },
        DEBUG: !release
    }));

    if (release) {
        ret.plugins.push(new webpack.optimize.UglifyJsPlugin({
            sourceMap: false,
            mangle: true,
            compress: {
                warnings: true
            }
        }));
        ret.sourcemaps = false;
        ret.debug = false;
    } else {
        ret.sourcemaps = true;
        ret.debug = true;
        ret.devtool = 'source-map';
    }

    return ret;
};
