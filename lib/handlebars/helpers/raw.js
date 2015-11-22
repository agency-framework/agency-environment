"use strict";
var fs = require('fs');
var glob = require('glob');

module.exports = function(filepath, options, cb) {
    glob(filepath, options, function (er, files) {
        readFiles(files, function(content) {
            cb(null, content);
        }, '');
    });
};

function readFiles(files , cb, fileContent) {
    fs.readFile(files.shift(), 'utf8', function(err, content) {
        fileContent += content;
        if(files.length) {
            readFiles(files, cb, fileContent);
        } else {
            cb(fileContent);
        }
    });
}