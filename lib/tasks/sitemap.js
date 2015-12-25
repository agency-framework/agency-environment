"use strict";

var gulp = require('gulp');
var sitemap = require('gulp-sitemap');
var taskGenerator = require('../taskGenerator');

module.exports = function(name, config, serverConfig) {
    return taskGenerator(name, config, serverConfig, function(taskName, task) {
        gulp.task(taskName, function() {
            return gulp.src(task.files.src)
                .pipe(sitemap({
                    siteUrl: task.domain
                }))
                .pipe(gulp.dest(task.files.dest));
        });
    });
};
