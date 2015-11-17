"use strict";

var assemble = require('assemble');
var gulp = require('gulp');
var webpackStream = require('webpack-stream');
var webpack = require('webpack');
var path = require('path');
var taskGenerator = require('../taskGenerator');

module.exports = function(name, config, serverConfig) {
    return taskGenerator(name, config, serverConfig, function(taskName, task) {
        assemble.task(taskName, function() {
            return gulp.src(task.files.src)
                .pipe(webpackStream({
                    plugins: function() {
                        return task.plugins.map(function(plugin) {
                            return require(plugin)(webpack);
                        });
                    }(),
                    module: {
                        preLoaders: (task.module.preLoaders || []).map(convertLoader),
                        loaders: (task.module.loaders || []).map(convertLoader),
                        postLoaders: (task.module.postLoaders || []).map(convertLoader)
                    },
                    output: {
                        filename: path.basename(task.files.dest)
                    }
                }, null))
                .pipe(gulp.dest(path.dirname(task.files.dest)));
        });
    });
};

function convertLoader(loader) {
    if(loader.exclude) {
        return {
            test: new RegExp(loader.test),
            exclude: new RegExp(loader.exclude),
            loader: loader.loader
        }
    } else {
        return {
            test: new RegExp(loader.test),
            loader: loader.loader
        }
    }
}