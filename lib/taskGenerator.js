"use strict";

var assemble = require('assemble');
var runSequence = require('run-sequence');

module.exports = function(name, config, serverConfig, taskPattern, mainTask) {

    var tasks = config.subtasks.map(function(task) {
        var taskName = name + ':' + task.name;
        taskPattern(taskName, task);
        return taskName;
    });

    if(serverConfig.livereload) {
        (config.watch || []).forEach(function(watch) {
            if(!watch.tasks) {
                assemble.watch(watch.src, [name]);
            } else {
                assemble.watch(watch.src, watch.tasks.map(function(task) {return name + ':' + task;}));
            }
        });
    }

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
    };
};
