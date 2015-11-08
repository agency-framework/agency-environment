"use strict";

var assemble = require('assemble');
var changed = require('gulp-changed');
var livereload = require('gulp-livereload');
var taskGenerator = require('../taskGenerator');

module.exports = function(name, config) {
    return taskGenerator(name, config, function(taskName, task) {
        assemble.task(taskName, function () {
            return assemble.src(task.files.src)
                .pipe(changed(task.files.dest, {hasChanged: changed.compareSha1Digest}))
                .pipe(assemble.dest(task.files.dest))
                .pipe(livereload());
        });
    });
};