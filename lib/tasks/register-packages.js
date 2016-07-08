"use strict";

var gulp = require('gulp');
var taskGenerator = require('../taskGenerator');
var upath = require('upath');

module.exports = function(name, config, serverConfig) {
    if (config) {
        return taskGenerator(name, config.registerpackages, serverConfig, function(taskName, task) {
            gulp.task(taskName, function() {
                var pattern = task.pattern.map(function(name) {
                    return upath.join('node_modules', name);
                });
                var pkgDocs = config.handlebars.subtasks.find(function(task) {
                    if (task.name === 'docs-packages') {
                        return true;
                    }
                });
                var pkgDocsSrc = [];
                if (pkgDocs) {
                    pkgDocsSrc = pkgDocs.files.src;
                }
                return gulp.src(pattern)
                    .on('data', function(file) {
                        console.log('register package', upath.basename(file.path));

                        var path = upath.join('node_modules', upath.basename(file.path), 'src/tmpl/partials/**/*.hbs');
                        config.handlebars.partials.files.src.push(path);
                        config.handlebars.layouts.files.src.push(path);
                        pkgDocsSrc.push(path);
                    });
            });
        });
    }
};
