"use strict";

require('colors');
var assemble = require('./lib/assemble/config');
var template = require('lodash/template');
var options = require('minimist')(process.argv.slice(2));
var upath = require('upath');
var registry = require('./lib/assemble/plugins/registry');


var gulp = require('gulp');
var runSequence = require('run-sequence').use(gulp);
var livereload = require('gulp-livereload');

var serverConfig = JSON.parse(template(JSON.stringify(require(upath.join(process.cwd(), options.serverConfig) || upath.join(process.cwd(), './env/config/local.json'))))({
    'root': process.cwd()
}))[(options.env || 'development')];
var tasksConfig = JSON.parse(template(JSON.stringify(require(upath.join(process.cwd(), options.configTasks))))({
    'destination': serverConfig.dest,
    'root': process.cwd()
}));

/*
 * Registry Setup
 */

if (options.env === 'package-build' || options.env === 'package-production' || options.env === 'package-development') {
    registry.srcPath = 'test';
}
registry.setConfig(tasksConfig.handlebars.registry);

/*
 * Handlebars Helpers
 */

(tasksConfig.handlebars.helpers || []).forEach(function(helper) {
    assemble.asyncHelper(helper.name, require(helper.src)({
        assemble: assemble,
        config: helper.config
    }));
});


/*
 * Tasks
 */

// general

gulp.task('clean', require('./lib/tasks/clean')('clean', tasksConfig.clean, serverConfig));
gulp.task('copy', require('./lib/tasks/copy')('copy', tasksConfig.copy, serverConfig));
gulp.task('fontmin', require('./lib/tasks/fontmin')('fontmin', tasksConfig.fontmin, serverConfig));
gulp.task('handlebars', require('./lib/tasks/handlebars')('handlebars', tasksConfig.handlebars, serverConfig));
gulp.task('postcss', require('./lib/tasks/postcss')('postcss', tasksConfig.postcss, serverConfig));
gulp.task('purecss', require('./lib/tasks/purecss')(tasksConfig.purecss));
gulp.task('sitemap', require('./lib/tasks/sitemap')('sitemap', tasksConfig.sitemap, serverConfig));
gulp.task('webpack', require('./lib/tasks/webpack')('webpack', tasksConfig.webpack, serverConfig)());
gulp.task('watch', function(cb) {
    if (serverConfig.livereload) {
        livereload.listen({
            port: serverConfig.livereload.port
        });
    }
    cb();
});

// register-packages

if (tasksConfig.registerpackages) {
    gulp.task('register-packages', require('./lib/tasks/register-packages')('register-packages', tasksConfig, serverConfig));
} else {
    console.log('[' + 'task'.gray + '][' + 'register-packages'.gray + ']', 'Missing Config'.bold.red);
}

// zip-compress

if (tasksConfig.zipcompress) {
    gulp.task('zip-compress', require('./lib/tasks/zip-compress')('zip-compress', tasksConfig.zipcompress, serverConfig));
} else {
    console.log('[' + 'task'.gray + '][' + 'zip-compress'.gray + ']', 'Missing Config'.bold.red);
}

// export

if (tasksConfig.export) {
    gulp.task('export', require('./lib/tasks/export')('export', tasksConfig.export, serverConfig));
} else {
    console.log('[' + 'task'.gray + '][' + 'export'.gray + ']', 'Missing Config'.bold.red);
}

// build

gulp.task('build', function(callback) {
    runSequence('prebuild', 'webpack:app', callback);
});

gulp.task('prebuild', function(callback) {
    runSequence('register-packages:default', 'clean', ['copy', 'fontmin', 'webpack:embed', 'purecss'], 'handlebars', 'postcss', 'handlebars', ['sitemap'], callback);
});

// banner build

gulp.task('build-banner', function(callback) {
    runSequence('clean', ['copy', 'fontmin', 'webpack:embed', 'webpack:app', 'postcss'], 'handlebars', 'zip-compress:banner', callback);
});

gulp.task('prebuild-banner', function(callback) {
    runSequence('clean', ['copy', 'fontmin', 'webpack:embed', 'postcss'], 'handlebars', callback);
});

module.exports = {
    serverConfig: serverConfig,
    tasksConfig: tasksConfig
};
