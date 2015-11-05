"use strict";

var assemble = require('assemble');
var changed = require('gulp-changed');
var livereload = require('gulp-livereload');

module.exports = function(dest) {
    return function() {
        return assemble.src('src/assets/**/*.{ttf,woff,eof,svg,ico,png,jpg,gif}')
            .pipe(changed(dest + '/assets', {hasChanged: changed.compareSha1Digest}))
            .pipe(assemble.dest(dest + '/assets'))
            .pipe(livereload());
    }
};