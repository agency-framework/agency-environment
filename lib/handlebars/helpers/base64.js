"use strict";
var fs = require('fs');
var upath = require('upath');

module.exports = function(filepath, options, cb) {
    fs.readFile(upath.join(process.cwd(), '/src/', filepath), function(err, content) {
        cb(null, new Buffer(content || '').toString('base64'));
    });
};
