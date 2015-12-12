"use strict";

var template = require('lodash/string/template');
var options = require('minimist')(process.argv.slice(2));
var serverConfig = JSON.parse(template(JSON.stringify(require((process.cwd() + '/' + options.serverConfig || (process.cwd() + '/' + './env/config/local.json')))))({'root': process.cwd()}))[(options.env || 'development')];
var tasksConfig = JSON.parse(template(JSON.stringify(require(process.cwd() + '/' + options.configTasks)))({'destination': serverConfig.dest, 'root': process.cwd()}));

var assemble = require('./lib/assemble/config');
var runSequence = require('run-sequence').use(assemble);
var livereload = require('gulp-livereload');

assemble.task('clean', require('./lib/tasks/clean')('clean', tasksConfig.clean, serverConfig));
assemble.task('copy', require('./lib/tasks/copy')('copy', tasksConfig.copy, serverConfig));
assemble.task('handlebars', require('./lib/tasks/handlebars')('handlebars', tasksConfig.handlebars, serverConfig));
assemble.task('postcss', require('./lib/tasks/postcss')('postcss', tasksConfig.postcss, serverConfig));
assemble.task('purecss', require('./lib/tasks/purecss')(tasksConfig.purecss));
assemble.task('sitemap', require('./lib/tasks/sitemap')('sitemap', tasksConfig.sitemap, serverConfig));
assemble.task('webpack', require('./lib/tasks/webpack')('webpack', tasksConfig.webpack, serverConfig)());
assemble.task('watch', function(cb) {
    if(serverConfig.livereload) {
        livereload.listen({
            port: serverConfig.livereload.port
        });
    }
    cb();
});

assemble.task('build', function(callback) {
    runSequence('prebuild', 'webpack:app', callback);
});

assemble.task('prebuild', function(callback) {
    runSequence('clean', ['copy', 'webpack:embed', 'purecss'], 'postcss', 'handlebars', ['sitemap'], callback);
});
