"use strict";

var gulp = require('gulp');
var taskGenerator = require('../taskGenerator');
var upath = require('upath');

module.exports = function(name, config, serverConfig) {
    if (config) {
        return taskGenerator(name, config.registerpackages, serverConfig, function(taskName, task) {
            gulp.task(taskName, function() {
                var src = config.handlebars.partials.files.src;
                var pattern = task.pattern.map(function (name) {
                    return './node_modules/' + name;
                });
                return gulp.src(pattern)
                    .on('data', function(file) {
                        console.log('register package', upath.basename(file.path));
                        src.push('./node_modules/' + upath.basename(file.path) + '/src/tmpl/partials/**/*.hbs');
                    });
            });
        });
    }
};
