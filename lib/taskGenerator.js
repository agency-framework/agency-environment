"use strict";

var gulp = require('gulp');
var gulpWatch = require('gulp-watch');
var runSequence = require('run-sequence');

module.exports = function(name, config, serverConfig, taskPattern, mainTask) {

    var tasks = config.subtasks.map(function(task) {
        var taskName = name + ':' + task.name;
        taskPattern(taskName, task);
        return taskName;
    });

    if (serverConfig.livereload) {
        (config.watch || []).forEach(function(watch) {
            if (!watch.tasks) {
                gulpWatch(watch.src, function() {
                    runSequence.use(gulp).call(null, [name]);
                });
            } else {
                gulpWatch(watch.src, function() {
                    runSequence.use(gulp).call(null, watch.tasks.map(function(task) {
                        return name + ':' + task;
                    }));
                });
            }
        });
    }

    return function(cb) {
        if (cb) {
            if (mainTask) {
                mainTask(config, tasks, cb);
            } else {
                runSequence.use(gulp).call(null, tasks, cb);
            }
        } else {
            return tasks;
        }
    };
};
