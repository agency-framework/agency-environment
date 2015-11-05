"use strict";

var assemble = require('assemble');
var rimraf = require('gulp-rimraf');

module.exports = function(dest) {
    return function () {
        return assemble.src(dest, { read: false })
            .pipe(rimraf({ force: true }));
    }
};