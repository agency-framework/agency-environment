"use strict";
var fs = require('fs');

module.exports = function(filepath, options, cb) {
    fs.readFile(process.cwd() + '/src/' + filepath, function(err, content) {
        cb(null, new Buffer(content || '').toString('base64'));
    });
};
