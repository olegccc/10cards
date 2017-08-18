var Mocha = require('mocha');
var path = require('path');

module.exports = function(grunt) {

    grunt.registerTask('run-tests', function() {
        var done = this.async();
        var mocha = new Mocha();
        var runner;
        try {
            mocha.addFile('debug/test.js');
            runner = mocha.run();
        } catch (error) {
            done(false);
            grunt.log.error(error);
            grunt.log.debug(error.stack);
            return;
        }
        var hasErrors = false;
        console.log('starting');
        runner.on('fail', function() {
            console.log('fail');
            hasErrors = true;
        });
        runner.on('end', function() {
            console.log('end');
            if (hasErrors) {
                done(false);
            } else {
                done();
            }
        });
    });

    grunt.registerTask('test', ['compile:test:debug', 'run-tests']);
};
