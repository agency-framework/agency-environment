"use strict";

var app = require('../assemble/config');
var gulp = require('gulp');
var runSequence = require('run-sequence').use(gulp);
var extname = require('gulp-extname');
var controller = require('../assemble/plugins/controller.js');
var errorHandler = require('../assemble/plugins/error').handlebars;
var livereload = require('gulp-livereload');
var taskGenerator = require('../taskGenerator');
var upath = require('upath');

module.exports = function(name, config, server) {

    var localPackagePartials = [];
    var renderings = [];

    app.option("assets", config.assets);

    gulp.task('handlebars_update', function() {

        // Double registration from partials for current package path.
        app.partials.option('renameKey', function(filename) {
            filename = renameKey(filename);
            if (localPackagePartials.indexOf(filename) > -1) {
                filename = upath.join(process.env.npm_package_name, filename);
            } else {
                localPackagePartials.push(filename);
            }
            return filename;
        });

        app.partials(config.partials.files.src, config.partials.options);
        localPackagePartials = [];

        app.partials.option('renameKey', renameKey);
        app.layouts.option('renameKey', renameKey);
        app.partials(config.partials.files.src, config.partials.options);
        app.layouts(config.layouts.files.src, config.layouts.options);

        app.data(config.globals.files.src, {
            namespace: function(filename, options) {
                return upath.relative(options.cwd, filename).replace(upath.extname(filename), '').replace(/\//g, '.');
            },
            cwd: config.globals.files.cwd
        });

    });

    var packagejs = config.packagejs;

    return taskGenerator(name, config, server, function(taskName, task) {

        gulp.task(taskName, function() {

            if (task.renderingOnce) {
                if (renderings.indexOf(task.name) < 0) {
                    console.log(task.name, 'once rendering');
                    renderings.push(task.name);
                } else {
                    console.log(task.name, 'already rendered');
                    return app.toStream(task.name);
                }
            }

            if (task.data) {
                app.data(task.data.src, {
                    namespace: function(filename, options) {
                        return upath.relative(options.cwd, filename).replace(upath.extname(filename), '');
                    },
                    cwd: task.data.cwd
                });
            }

            app.create(task.name).use(function() {
                return function(view) {

                    if (!view.layout) {
                        view.layout = task.layout;
                    }
                };
            });

            app[task.name](task.files.src, {
                base: task.files.base
            });

            return app.toStream(task.name)
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
            controller.createRegistry(packagejs, config.controllerRegistry, cb);
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

/**
 * Clean filename for local and package require.
 */
function renameKey(filename) {
    var localPath = process.cwd();
    if (filename.indexOf('node_modules') !== -1) {
        filename = filename.replace(upath.resolve(localPath, 'node_modules') + '/', '');
        filename = filename.replace('/' + upath.basename(filename), '');
    } else {
        filename = filename.replace(upath.resolve(localPath, 'node_modules') + '/', '');
        filename = filename.replace(localPath + '/', '');
        filename = filename.replace(/(src|test)\/tmpl\/partials\//, '');
        var match = filename.match(/src\/(.*)\/index/);
        if (match) {
            filename = match[1];
        }
        filename = filename.replace(upath.extname(filename), '');
    }
    return filename;
}
