"use strict";

var gulp = require('gulp');
var fontmin = require('gulp-fontmin');
var taskGenerator = require('../taskGenerator');

module.exports = function(name, config, serverConfig) {
    if(config) {
        return taskGenerator(name, config, serverConfig, function(taskName, task) {
            gulp.task(taskName, function () {
                return gulp.src(task.files.src)
                    .pipe(fontmin({
                        text: task.text,
                    }))
                    .pipe(gulp.dest(task.files.dest));
            });
        });
    }
};
