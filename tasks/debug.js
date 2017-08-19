module.exports = function(grunt) {

    grunt.registerTask('debug_child', function() {

        var done = this.async();
        var fs = require('fs');

        function startChild() {

            var child = require('child_process').execFile('node', ['./server/server'], {
                cwd: './debug'
            }, function(error) {
                if (error && !child.ignore) {
                    grunt.log.error(error);
                    done(false);
                    return;
                }
            });

            grunt.log.ok('Server process started, pid ' + child.pid);

            child.stdout.on('data', function(data) {
                console.log(data);
            });

            child.stderr.on('data', function(data) {
                grunt.log.error(data);
            });

            return child;
        }

        var child = startChild();

        var fileToWatch = './debug/server/server.js';

        fs.watchFile(fileToWatch, function() {

            if (!fs.existsSync(fileToWatch)) {
                // compilation failed, nothing to restart
                return;
            }

            grunt.log.ok('Detected server.js changes, restarting');
            child.ignore = true;
            process.kill(child.pid, 'SIGINT');
            child = startChild();
        });

    });

    grunt.registerTask('debug_pm2', function() {

        var pm2 = require('pm2');

        var done = this.async();

        // we need to kill the daemon if it exists, in order to be sure all tasks are closed once this task is finished
        pm2.killDaemon(function(err) {

            console.log('1');

            if (err) {
                grunt.log.error(err);
            }

            pm2.connect(true, function(err) {

                console.log('2');

                if (err) {
                    grunt.log.error(err);
                    done(false);
                    return;
                }

                pm2.start({
                    script: './debug/server/server.js',
                    cwd: './debug',
                    watch: true
                }, function(err) {

                    console.log('3');

                    if (err) {
                        grunt.log.error(err);
                    } else {
                        grunt.log.ok('Server started');
                    }
                });
            });
        });
    });

    grunt.registerTask('debug', function(option) {
        grunt.task.run([
            'compile:client:debug:true',
            'compile:server:debug:true',
            'debug_child'
        ]);
    });
};
