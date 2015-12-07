"use strict";

var assemble = require('assemble');
var runSequence = require('run-sequence').use(assemble);
var extname = require('gulp-extname');
var controller = require('../assemble/plugins/controller.js');
var errorHandler = require('../assemble/plugins/error');
var livereload = require('gulp-livereload');
var taskGenerator = require('../taskGenerator');
var upath = require('upath');

module.exports = function(name, config, server) {

    return taskGenerator(name, config, server, function(taskName, task) {
        assemble.option("assets", config.assets);
        assemble.task(taskName, function() {
            assemble.layouts(config.layouts);
            assemble.partials(config.partials);
            if(task.data) {
                assemble.data(task.data.src, {
                    namespace: function(filename, options) {
                        return upath.relative(options.cwd, filename).replace(upath.extname(filename), '');
                    },
                    cwd: process.cwd() + '/' + task.data.cwd
                });
            }
            return assemble.src(task.files.src, getData(task.layout, config.scripts, server))
                .on('error', errorHandler)
                .pipe(extname())
                .on('error', errorHandler)
                .pipe(assemble.dest(task.files.dest))
                .on('error', errorHandler)
                .pipe(controller.collect())
                .on('error', errorHandler);
        });
    }, function(config, tasks, cb) {
        controller.reset();
        runSequence.call(null, tasks, function() {
            controller.createRegistry(cb);
            livereload.changed('all');
        });
    });
};

function getData(layout, scripts, server) {
    return {
        layout: layout,
        server: server,
        scripts: scripts
    };
}
