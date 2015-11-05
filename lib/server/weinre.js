'use strict';

var weinre = require('gulp-weinre');
console.log(weinre);

module.exports = function(config) {
    weinre({
        httpPort: config.port,
        boundHost: '-all-'
    });
}