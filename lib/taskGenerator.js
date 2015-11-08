"use strict";

var assemble = require('assemble');
var flatten = require('lodash/array/flatten');
var runSequence = require('run-sequence');

module.exports = function(name, config, taskPattern, mainTask) {

    var tasks = config.subtasks.map(function(task) {
        var taskName = name + ':' + task.name;
        taskPattern(taskName, task);
        return taskName;
    });

    (config.watch || []).forEach(function(watch) {
        if(!watch.tasks) {
            assemble.watch(watch.src, config.subtasks.map(function(task) {return name + ':' + task.name;}));
        } else {
            assemble.watch(watch.src, watch.tasks.map(function(task) {return name + ':' + task;}));
        }
    });

    return function(cb) {
        if(cb) {
            if(mainTask) {
                mainTask(config, tasks, cb);
            } else {
                runSequence.use(assemble).call(null, tasks, cb);
            }
        } else {
            return tasks;
        }

    }
};