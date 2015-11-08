"use strict";

var assemble = require('assemble');
var gulp = require('gulp');
var sitemap = require('gulp-sitemap');
var taskGenerator = require('../taskGenerator');

module.exports = function(name, config) {
    return taskGenerator(name, config, function(taskName, task) {
        assemble.task(taskName, function() {
            return gulp.src(task.files.src)
                .pipe(sitemap({
                    siteUrl: task.domain
                }))
                .pipe(gulp.dest(task.files.dest))
        });
    });
};