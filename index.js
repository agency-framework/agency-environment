"use strict";

module.exports = function(server, config, instance) {
    var assemble = require('./lib/assemble/config');
    var runSequence = require('run-sequence').use(assemble);
    var livereload = require('gulp-livereload');

    assemble.task('clean', require('./lib/tasks/clean')('clean', config.tasks.clean));
    assemble.task('copy', require('./lib/tasks/copy')('copy', config.tasks.copy));
    assemble.task('handlebars', require('./lib/tasks/handlebars')('handlebars', config.tasks.handlebars, server));
    assemble.task('postcss', require('./lib/tasks/postcss')('postcss', config.tasks.postcss));
    assemble.task('purecss', require('./lib/tasks/purecss')(config.tasks.purecss));
    assemble.task('sitemap', require('./lib/tasks/sitemap')('sitemap', config.tasks.sitemap));
    assemble.task('webpack', require('./lib/tasks/webpack')('webpack', config.tasks.webpack)());
    assemble.task('watch', function(cb) {
        if(server.livereload) {
            livereload.listen({port: server.livereload.port});
        }
        cb();
    });

    assemble.task('default', ['watch', 'server']);

    assemble.task('run', function(callback) {
        if(instance === 'development') {
            runSequence('prebuild', 'default', callback);
        } else {
            runSequence('build', 'server', callback);
        }
    });

    assemble.task('build', function(callback) {
        runSequence('prebuild', 'webpack:app', callback);
    });

    assemble.task('prebuild', function(callback) {
        runSequence('clean', ['copy', 'webpack:embed', 'purecss'], 'postcss', 'handlebars', ['sitemap'], callback);
    });

    assemble.task('server', function () {
        if(instance === 'development') {
            require('gulp-nodemon')({
                script: require.resolve(config.server.name),
                ignore: ['src/**/*'],
                args: ['--config=' + config.server.config],
                env: {CONFIG: JSON.stringify(server)}
            });
        } else {
            require(server.script)(server);
        }
    });
};

process.once('SIGINT', function() { process.exit(0); });