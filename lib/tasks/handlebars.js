"use strict";

var app = require('../assemble/config');
var gulp = require('gulp');
var runSequence = require('run-sequence').use(gulp);
var extname = require('gulp-extname');
var changed = require('gulp-changed');
var controller = require('../assemble/plugins/controller.js');
var errorHandler = require('../assemble/plugins/error');
var livereload = require('gulp-livereload');
var taskGenerator = require('../taskGenerator');
var upath = require('upath');

module.exports = function(name, config, server) {
    app.option("assets", config.assets);

    gulp.task('handlebars_update', function() {
        app.layouts(config.layouts);
        app.partials(config.partials);
    });

    return taskGenerator(name, config, server, function(taskName, task) {
        gulp.task(taskName, function() {
            if(task.data) {
                app.data(task.data.src, {
                    namespace: function(filename, options, config) {
                        return upath.relative(config.cwd, filename).replace(upath.extname(filename), '');
                    },
                    cwd: process.cwd() + '/' + task.data.cwd
                });
            }
            return app.src(task.files.src, {layout: 'LAYOUTS/XYZ'})
                .pipe(app.renderFile(getData(config.scripts, server, config.fonts)))
                .on('error', errorHandler)
                .pipe(extname())
                .on('error', errorHandler)
                // .pipe(changed(task.files.dest, {hasChanged: changed.compareSha1Digest}))
                .on('error', errorHandler)
                .pipe(app.dest(task.files.dest))
                .on('error', errorHandler)
                .pipe(controller.collect())
                .on('error', errorHandler);
        });
    }, function(config, tasks, cb) {
        controller.reset();
        runSequence.call(null, ['handlebars_update'].concat(tasks), function() {
            livereload.changed('all');
            controller.createRegistry(cb);

        });
    });
};

function getData(scripts, server, fonts) {
    return {
        options: {
            server: server,
            scripts: scripts,
            fonts: fonts
        }
    };
}
