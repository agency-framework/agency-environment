"use strict";

var gulp = require('gulp');
var taskGenerator = require('../../taskGenerator');
var runSequence = require('run-sequence').use(gulp);

module.exports = function(name, config, serverConfig) {
    if (config) {
        return taskGenerator(name, config, serverConfig, function(taskName, task) {
            gulp.task(taskName, function() {
                return gulp.src(task.files.src, task.options)
                    .pipe(gulp.dest(task.files.dest));
            });
        }, function(config, tasks, cb) {
            runSequence.call(null, tasks, function() {
                cb();
            });
        });
    }
};
