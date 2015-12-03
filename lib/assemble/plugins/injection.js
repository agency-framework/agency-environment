'use strict';

var inject = require('gulp-inject');
var file = require('gulp-file');
var template = require('./injection/template.hbs');

module.exports = function(config) {
    var injectContent = template(config);
    return inject(file('inject.hbs', injectContent, {src: true}), {
        removeTags: true,
        transform: function (filePath, fileObj) {
            return fileObj.contents.toString('utf8');
        }
    });
};
