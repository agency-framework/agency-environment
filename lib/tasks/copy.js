"use strict";

var gulp = require('gulp');
var changed = require('gulp-changed');
var livereload = require('gulp-livereload');
var taskGenerator = require('../taskGenerator');

module.exports = function(name, config, serverConfig) {
    return taskGenerator(name, config, serverConfig, function(taskName, task) {
        gulp.task(taskName, function () {
            return gulp.src(task.files.src)
                .pipe(changed(task.files.dest, {hasChanged: changed.compareSha1Digest}))
                .pipe(gulp.dest(task.files.dest))
                .pipe(livereload());
        });
    });
};
