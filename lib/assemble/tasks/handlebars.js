"use strict";

var assemble = require('assemble');
var runSequence = require('run-sequence').use(assemble);
var extname = require('gulp-extname');
var controller = require('../plugins/controller.js');
var injection = require('../plugins/injection.js');
var errorHandler = require('../plugins/error');
var livereload = require('gulp-livereload');

module.exports = function(config) {

    return function(cb) {
        controller.reset();

        assemble.layouts('src/tmpl/partials/layouts/*.hbs');
        assemble.partials(['src/tmpl/partials/**/*.hbs']);

        assemble.task('handlebars:pages', function() {
            return assemble.src(['src/tmpl/**/*.hbs', '!src/tmpl/partials/**/*.hbs'], getData('default', config))
                .on('error', errorHandler)
                .pipe(extname())
                .pipe(assemble.dest(config.dest + '/'))
                .pipe(injection(config))
                .pipe(assemble.dest(config.dest + '/'))
                .pipe(livereload())
                .pipe(controller.collect())
        });

        assemble.task('handlebars:partials', function() {
            return assemble.src(['src/tmpl/partials/**/*.hbs', '!src/tmpl/partials/common/**/*.hbs', '!src/tmpl/partials/layouts/**/*.hbs'], getData('default', config))
                .on('error', errorHandler)
                .pipe(extname())
                .pipe(assemble.dest(config.dest + '/partials/'))
                .pipe(injection(config))
                .pipe(assemble.dest(config.dest + '/partials/'))
                .pipe(livereload())
                .pipe(controller.collect())
        });

        assemble.task('handlebars:controllers', function(cb) {
            controller.createRegistry();
            cb();
        });

        runSequence('handlebars:pages', 'handlebars:partials', 'handlebars:controllers', cb);
    }
}

function getData(layout, config) {
    return {
        layout: 'layouts/' + layout,
        env: {
            js: {
                main: config.dest + '/js/app.js',
                embed: config.dest + '/js/embed.js'
            },
            css: {
                main: config.dest + '/css/style.css',
                critical: config.dest + '/css/critical.css'
            },
            webpack: config.webpack
        }
    }
}