"use strict";
var fs = require('fs');

module.exports = function(filepath, options, cb) {
    fs.readFile(filepath, 'utf8', cb);
};