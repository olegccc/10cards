// var webpack = require('webpack');
// var WebpackDevServer = require('webpack-dev-server');
// var webpackDevConfig = require('../config/webpack.dev.config');
// var path = require('path');

module.exports = function(grunt) {
    grunt.registerTask('view', function(module) {

        // console.log('module: ' + module);
        //
        //
        // var modulePath = module;
        //
        // var webpackConfig = require('../config/webpack.' + modulePath + '.config');
        // var compiler = webpack(webpackConfig(grunt, module, false));
        // var server = new WebpackDevServer(compiler, webpackDevConfig(module));
        //
        //
        // var compilerConfig = {
        //     aggregateTimeout: 300,
        //     poll: true
        // };
        //
        // function namedCompilerCallback(module) {
        //     return function(err, stats) {
        //         if (stats.hasErrors()) {
        //             var errors = stats.toJson('errors-only');
        //             if (errors.errors && errors.errors.length) {
        //                 grunt.log.error('Module "' + module + '" compile errors:');
        //                 errors.errors.forEach(function(error) { grunt.log.error(error); });
        //             } else {
        //                 grunt.log.error('Module "' + module + '" compile errors', errors);
        //             }
        //         } else {
        //             grunt.log.debug('Module "' + module + '" compiled successfully');
        //         }
        //     }
        // }
        //
        // var serverCompiler = webpack(webpackServerConfig(grunt, false));
        // serverCompiler.watch(compilerConfig, namedCompilerCallback('server'));
        //
        // var Server = require('../debug/server').default;
        // new Server(server.listeningApp, server.app);
        //
        // var portNumber = grunt.config('port');
        //
        // server.listen(portNumber, function() {
        //     console.log('Server started at localhost:' + portNumber);
        // });
        //
        // this.async();
    });
};
