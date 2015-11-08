"use strict";

var assemble = require('assemble');
var rimraf = require('gulp-rimraf');
var taskGenerator = require('../taskGenerator');

module.exports = function(name, config) {
    return taskGenerator(name, config, function(taskName, task) {
        assemble.task(taskName, function () {
            return assemble.src(task.files.dest, { read: false })
                .pipe(rimraf({ force: true }));
        });
    });
};