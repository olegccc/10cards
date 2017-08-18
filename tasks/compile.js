var webpack = require('webpack');

module.exports = function(grunt) {

    grunt.registerTask('compile', function(module, configuration, watch) {

        grunt.log.debug('module: ' + module);
        grunt.log.debug('configuration: ' + configuration);

        if (!/^(client|server)$/.test(module)) {
            grunt.log.error('Module \"' + module + '\" is not supported');
            return;
        }

        if (configuration !== 'debug' && configuration !== 'release') {
            grunt.log.error('Configuration (debug/release) is not specified');
            return;
        }

        var done = this.async();

        var config = require('../config/webpack.' + module + '.config')(grunt, module, configuration === 'release');

        config.watch = Boolean(watch);

        grunt.log.debug('Using config: ', config);

        var compiler = webpack(config);

        var callback = function(error, stats) {

            if (error) {
                grunt.log.error(error);
                done(false);
                return;
            }

            if (stats.hasErrors()) {
                var errors = stats.toJson('errors-only');
                grunt.log.error('Compile errors:');
                errors.errors.forEach(function(error) { grunt.log.error(error); });
                done(false);
                return;
            }

            grunt.log.ok(module + ' compiled successfully');
            done();
        };

        if (config.watch) {
            compiler.watch({
            }, callback);
        } else {
            compiler.run(callback);
        }
    });
};
