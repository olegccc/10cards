module.exports = function(grunt) {

    grunt.registerTask('runRelease', function() {

        process.chdir('./release');

        require('../release/server.js');

        // require('child_process').execFile('node', ['./server'], {
        //     cwd: './release'
        // }, function(error) {
        //     if (error) {
        //         grunt.log.error(error);
        //         done(false);
        //         return;
        //     }
        // });
        //
        this.async();
    });

    grunt.registerTask('release', function(option) {

        var tasks = [
            'compile:client:release:true',
            'compile:server:release:true'
        ];

        if (option === 'run') {
            tasks.push('runRelease');
        }

        grunt.task.run(tasks);
    });
};
