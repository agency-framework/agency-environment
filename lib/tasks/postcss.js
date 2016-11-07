"use strict";

var fs = require('fs');
var upath = require('upath');
var gulp = require('gulp');
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var extname = require('gulp-extname');
var livereload = require('gulp-livereload');
var errorHandler = require('../assemble/plugins/error').postcss;
var taskGenerator = require('../taskGenerator');

var regex_isPackage = null;
var regex_hasExtendPCSS = RegExp(/\.pcss$/);

module.exports = function(name, config, serverConfig) {
    return taskGenerator(name, config, serverConfig, function(taskName, task) {
        regex_isPackage = RegExp(task.packagePattern.join('|'));
        gulp.task(taskName, function() {
            var pipe = gulp.src(task.files.src)
                .on('error', errorHandler);
            if (task.sourcemap) {
                pipe = pipe.pipe(sourcemaps.init());
            }
            pipe = pipe.on('error', errorHandler)
                .pipe(extname('css'))
                .on('error', errorHandler)
                .pipe(plumber())
                .pipe(postcss(task.plugins.map(function(plugin) {
                    if (plugin.name === 'postcss-import') {
                        plugin.params.push({
                            resolve: renameResolve
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
        watch([task.files.dest + '/**/style.css'], function(file) {
            livereload.changed(file);
        });
    });
};

function renameResolve(id, options) {
    var path;
    if (regex_isPackage.test(id)) {
        path = renameKeyPackage(options, id, path);
    } else {
        path = renameKey(options, id, path);
    }
    return path;
}

function renameKeyPackage(options, id, path) {
    if (regex_hasExtendPCSS.test(id)) {
        path = id.replace(/\.\//, '').split('/');
        var filename = path[path.length - 1];
        path.push(filename);
        path[path.length - 2] = 'pcss';
        path = path.join('/');
        if (id.indexOf(process.env.npm_package_name) !== -1) {
            path = upath.resolve(process.cwd(), 'src', path.replace(process.env.npm_package_name + '/', ''));
        } else {
            path = upath.resolve(process.cwd(), 'node_modules', path);
        }
        if (fs.statSync(path).isDirectory()) {
            // @import "package/element"; -> @import "package/element/default.pcss"
            path = upath.join(path, 'default.pcss');
        }
    } else {
        if (id === process.env.npm_package_name) {
            path = upath.resolve(process.cwd(), 'src/pcss/default.pcss');
        } else {
            path = upath.resolve(process.cwd(), 'node_modules', id, 'pcss/default.pcss');
        }
    }
    return path;
}

function renameKey(options, id, path) {
    // @TODO added config for available file types for postcss-import
    path = upath.resolve(options.paths[0], id);
    if (!fs.statSync(path).isFile()) {
        path = id.replace(/\.\//, '').split('/');
        path[0] = upath.join(path[0], 'src/pcss');
        path = upath.resolve(process.cwd(), 'node_modules', path.join('/'));
    }
    return path;
}
