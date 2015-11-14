"use strict";

var assemble = require('assemble');
var runSequence = require('run-sequence').use(assemble);
var extname = require('gulp-extname');
var controller = require('../assemble/plugins/controller.js');
var injection = require('../assemble/plugins/injection.js');
var errorHandler = require('../assemble/plugins/error');
var livereload = require('gulp-livereload');
var taskGenerator = require('../taskGenerator');

module.exports = function(name, config, server) {
    return taskGenerator(name, config, function(taskName, task) {
        assemble.task(taskName, function() {
            assemble.layouts(config.layouts);
            assemble.partials(config.partials);
            return assemble.src(task.files.src, getData(task.layout, server))
                .on('error', errorHandler)
                .pipe(extname())
                .pipe(assemble.dest(task.files.dest))
                .pipe(livereload())
                .pipe(controller.collect())
        });
    }, function(config, tasks, cb) {
        controller.reset();
        runSequence.call(null, tasks, function() {
            controller.createRegistry();
            cb();
        });
    });
};

function getData(layout, server) {
    return {
        layout: layout,
        env: {
            js: {
                main: server.dest + '/js/app.js',
                embed: server.dest + '/js/embed.js'
            },
            css: {
                main: server.dest + '/css/style.css',
                critical: server.dest + '/css/critical.css'
            },
            server: server
        }
    }
}