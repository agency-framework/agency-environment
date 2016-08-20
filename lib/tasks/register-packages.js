"use strict";

require('colors');
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
                var pkgHandlbarsDocs = config.handlebars.subtasks.find(function(task) {
                    if (task.name === 'docs-packages') {
                        return true;
                    }
                });
                var pkgExportHbsDocs = null;
                if (config.exporthbs && config.exporthbs.subtasks) {
                    pkgExportHbsDocs = config.exporthbs.subtasks.find(function(task) {
                        if (task.name === 'packages') {
                            return true;
                        }
                    });
                } else {
                    console.log('[' + 'task'.gray + '][' + 'register-packages'.gray + ']', 'Missing Config','\'' + 'export-hbs'.red + '\'');
                }
                var pkgHandlbarsDocsSrc = [];
                if (pkgHandlbarsDocs) {
                    pkgHandlbarsDocsSrc = pkgHandlbarsDocs.files.src;
                }
                var pkgExportHbsDocsSrc = [];
                if (pkgExportHbsDocs) {
                    pkgExportHbsDocsSrc = pkgExportHbsDocs.files.src;
                }
                return gulp.src(pattern)
                    .on('data', function(file) {
                        if (process.env.npm_package_name !== upath.basename(file.path)) {
                            console.log('[' + 'task'.gray + '][' + 'register-packages'.gray + ']', 'Register Package \'' + upath.basename(file.path).green + '\'');
                            var path = upath.join('node_modules', upath.basename(file.path), '**/*.hbs');
                            config.handlebars.partials.files.src.push(path);
                            config.handlebars.layouts.files.src.push(path);
                            pkgHandlbarsDocsSrc.push(path);
                            pkgExportHbsDocsSrc.push(path);
                        }
                    });
            });
        });
    }
};
