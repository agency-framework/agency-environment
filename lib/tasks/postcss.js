"use strict";

var assemble = require('assemble');
var postcss = require('gulp-postcss');
var livereload = require('gulp-livereload');
var errorHandler = require('../assemble/plugins/error');
var taskGenerator = require('../taskGenerator');

module.exports = function(name, config) {
    return taskGenerator(name, config, function(taskName, task) {
        assemble.task(taskName, function() {
            return assemble.src(task.files.src)
                .pipe(postcss(task.plugins.map(function(plugin) {
                    return require(plugin.name).apply(null, plugin.params);
                }), {
                    map: {
                        inline: task.sourcemap
                    }
                }))
                .on('error', errorHandler)
                .pipe(assemble.dest(task.files.dest))
                .pipe(livereload());
        });
    });
};
