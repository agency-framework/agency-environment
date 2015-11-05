"use strict";

var assemble = require('assemble');
var gulp = require('gulp');
var webpackStream = require('webpack-stream');
var webpack = require('webpack');

module.exports = function(dest) {
    assemble.task('webpack:embed', function() {
        return gulp.src(['src/js/embed.js'])
            .pipe(webpackStream({
                plugins: [
                    require('../../webpack/plugins/polyfills')(),
                    require('../../webpack/plugins/dedupe')(webpack),
                    require('../../webpack/plugins/uglify')(webpack)
                ],
                module: {
                    preLoaders: [
                        {
                            test: /\.js$/, // include .js files
                            exclude: /node_modules/, // exclude any and all files in the node_modules folder
                            loader: "jshint-loader"
                        }
                    ]
                },
                output: {
                    filename: 'embed.js'
                }
            }, null))
            .pipe(gulp.dest(dest + '/js/'));
    });

    assemble.task('webpack:main', function() {
        return gulp.src('src/js/main.js')
            .pipe(webpackStream({
                plugins: [
                    require('../../webpack/plugins/dedupe')(webpack),
                    require('../../webpack/plugins/uglify')(webpack)
                ],
                module: {
                    preLoaders: [
                        {
                            test: /\.js$/, // include .js files
                            exclude: /node_modules/, // exclude any and all files in the node_modules folder
                            loader: "jshint-loader"
                        }
                    ],
                    loaders: [
                        { test: /\.hbs$/, loader: "handlebars-loader" },
                        { test: /\.css$/, loader: "style-loader!css-loader" },
                        { test: /\.(png|jpg|gif|svg|ttf|woff|eot)$/, loader: "url-loader?limit=100000" }
                    ]
//                postLoaders: [
//                    {
//                        test: /\.js$/,
//                        exclude: /\/(node_modules|bower_components|Promise)\//,
//                        loader: 'autopolyfiller',
//                        query: { browsers: [ '> 5%', 'last 2 versions', 'ie 9', 'Firefox ESR' ] }
//                    }
//                ]
                },
                output: {
                    filename: 'app.js'
                }
            }, null))
            .pipe(gulp.dest(dest + '/js/'));
    });

    return ['webpack:embed', 'webpack:main'];
}