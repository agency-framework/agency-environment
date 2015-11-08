"use strict";
var fs = require('fs');

module.exports = function(filepath) {
    return fs.readFileSync(filepath, 'utf8');
};