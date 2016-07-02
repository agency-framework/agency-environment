"use strict";

var gulp = require('gulp');
var upath = require('upath');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var extname = require('gulp-extname');
var livereload = require('gulp-livereload');
var errorHandler = require('../assemble/plugins/error').postcss;
var taskGenerator = require('../taskGenerator');
var postcssImportResolve = require("postcss-import/lib/resolve-id");


module.exports = function(name, config, serverConfig) {
    return taskGenerator(name, config, serverConfig, function(taskName, task) {
        gulp.task(taskName, function() {
            var pipe = gulp.src(task.files.src)
                .on('error', errorHandler);
            if (task.sourcemap) {
                pipe = pipe.pipe(sourcemaps.init());
            }
            pipe = pipe.on('error', errorHandler)
                .pipe(extname('css'))
                .on('error', errorHandler)
                .pipe(postcss(task.plugins.map(function(plugin) {
                    if (plugin.name === 'postcss-import') {
                        plugin.params.push({
                            resolve: function(id, base, options) {
                            console.log(arguments);
                                if (task.packagePattern.find(function(value) {
                                        if (RegExp(value).test(id)) {
                                            return true;
                                        }
                                    })) {
                                    if (RegExp(/\.pcss$/).test(id)) {
                                        var path = id.replace(/\.\//, '').split('/');
                                        path[0] = path[0] + '/src/pcss';
                                        path = path.join('/');
                                        console.log('node_modules/' + path);
                                        return 'node_modules/' + path;
                                    } else {
                                        return 'node_modules/' + id.replace(/\.\//, '') + '/src/pcss/index.pcss';
                                    }
                                } else {
                                    return options.baseDir+'2000' + id;
                                }
                            }
                        });
                    }
                    return require(plugin.name).apply(null, plugin.params);
                })))
                .on('error', errorHandler);
            if (task.sourcemap) {
                pipe = pipe.pipe(sourcemaps.write('.', {
                        sourceMappingURLPrefix: '/' + upath.relative(serverConfig.root, task.files.dest)
                    }))
                    .on('error', errorHandler);
            }
            return pipe.pipe(gulp.dest(task.files.dest));
        });
        gulp.watch([task.files.dest + '/**/style.css'], function(file) {
            livereload.changed(file);
        });
    });
};
