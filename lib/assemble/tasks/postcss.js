"use strict";

var assemble = require('assemble');
var postcss = require('gulp-postcss');
var livereload = require('gulp-livereload');
var errorHandler = require('../plugins/error');

module.exports = function(dest) {
    return function() {
        return assemble.src(['src/css/style.css', 'src/css/critical.css'])
            .pipe(postcss([
                require('postcss-import')(),
                require('precss')({}),
                require('autoprefixer')({browsers: ['> 5%', 'last 2 versions', 'Firefox ESR']}),
                require('postcss-discard-comments')({removeAll: true})
//                require('cssnano')() // CSS Nano is bullshit
            ], {
                map: {
                    inline: true
                }
            }))
            .on('error', errorHandler)
            .pipe(assemble.dest(dest + '/css'))
            .pipe(livereload());
    }
};
