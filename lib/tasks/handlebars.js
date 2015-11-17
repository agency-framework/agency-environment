"use strict";

var assemble = require('assemble');
var runSequence = require('run-sequence').use(assemble);
var extname = require('gulp-extname');
var controller = require('../assemble/plugins/controller.js');
var injection = require('../assemble/plugins/injection.js');
var errorHandler = require('../assemble/plugins/error');
var livereload = require('gulp-livereload');
var taskGenerator = require('../taskGenerator');
var path = require('path');
var upath = require('upath');

module.exports = function(name, config, server) {

    return taskGenerator(name, config, server, function(taskName, task) {
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
                .pipe(assemble.dest(task.files.dest))
                .pipe(livereload())
                .pipe(controller.collect())
        });
    }, function(config, tasks, cb) {
        controller.reset();
        runSequence.call(null, tasks, function() {
            controller.createRegistry(cb);
        });
    });
};

function getData(layout, scripts, server) {
    return {
        layout: layout,
        server: server,
        scripts: scripts
    }
}