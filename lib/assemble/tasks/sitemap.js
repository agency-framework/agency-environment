"use strict";

var gulp = require('gulp');
var sitemap = require('gulp-sitemap');

module.exports = function(dest) {
    return function () {
        return gulp.src([dest + '/**/*.html', '!' + dest + '/partials/**/*.html'])
            .pipe(sitemap({
                siteUrl: 'http://www.amazon.com'
            }))
            .pipe(gulp.dest(dest + '/'))
    }
};