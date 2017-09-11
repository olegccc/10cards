var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
var path = require('path');

var projectPath = path.join(__dirname, '..');

module.exports = function (grunt, module, release) {

    var stylesPath = projectPath + '/' + module + '/styles';

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
            rules: [
                {
                    test: /\.jsx?$/,
                    include: sourcePath,
                    use: [{
                        loader: 'babel-loader',
                        options: {
                            presets: ['react', 'es2015', 'stage-0']
                        }
                    }]
                },
                {
                    test: /\.css$/,
                    include: path.join(projectPath, 'client/styles'),
                    use: [
                        'style-loader',
                        { loader: 'css-loader', options: {
                            importLoaders: 1,
                            //sourceMap: !release
                        }},
                        { loader: 'postcss-loader', options: {
                            plugins: function() {
                                return [
                                    require('autoprefixer'),
                                    require('postcss-import')({
                                        root: projectPath
                                    }),
                                    require('precss')()
                                ];
                            }
                        }}
                    ]
                },
                {
                    test: /\.css$/,
                    exclude: sourcePath,
                    use: [
                        'style-loader',
                        { loader: 'css-loader', options: {
                            modules: true,
                            importLoaders: 1
                        }},
                        { loader: 'postcss-loader', options: {
                            plugins: function() {
                                return [
                                    require('postcss-cssnext')({
                                        features: {
                                            customProperties: {
                                                variables: require(path.join(projectPath, 'config', 'react-toolbox.config'))
                                            }
                                        }
                                    })
                                ]
                            }
                        }}
                    ]
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
    } else {
        ret.plugins.push(new webpack.LoaderOptionsPlugin({
            debug: true
        }));
        ret.devtool = 'source-map';
    }

    return ret;
};
