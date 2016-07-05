"use strict";

var fs = require('fs');
var upath = require('upath');
var gulp = require('gulp');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var extname = require('gulp-extname');
var livereload = require('gulp-livereload');
var errorHandler = require('../assemble/plugins/error').postcss;
var taskGenerator = require('../taskGenerator');

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
                            resolve: function(id, options) {
                                if (task.packagePattern.find(function(value) {
                                    return RegExp(value).test(id);
                                    })) {
                                    if (RegExp(/\.pcss$/).test(id)) {
                                        var path = id.replace(/\.\//, '').split('/');
                                        path[0] = upath.join(path[0], 'src/pcss');
                                        return upath.resolve(process.cwd(), 'node_modules', path.join('/'));
                                    } else {
                                        return upath.resolve(process.cwd(), 'node_modules', id, 'index.pcss');
                                    }
                                } else {
                                    // @TODO added config for available file types for postcss-import
                                    if (fs.existsSync(upath.resolve(options.paths[0], id))) {
                                        return upath.resolve(options.paths[0], id);
                                    } else {
                                        return upath.resolve(options.paths[0], id.replace(/\.css$/, '.pcss'));
                                    }
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
