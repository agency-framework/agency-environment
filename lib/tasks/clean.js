"use strict";

var gulp = require('gulp');
var rimraf = require('gulp-rimraf');
var taskGenerator = require('../taskGenerator');

module.exports = function(name, config, serverConfig) {
    return taskGenerator(name, config, serverConfig, function(taskName, task) {
        gulp.task(taskName, function () {
            return gulp.src(task.files.dest, { read: false })
                .pipe(rimraf({ force: true }));
        });
    });
};
