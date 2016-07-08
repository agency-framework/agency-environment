"use strict";

var glob = require('glob');
var upath = require('upath');
var exts = require('ext-map');
var zipObjectDeep = require('lodash/zipObjectDeep');
var merge = require('mixin-deep');

module.exports = function(filepath, opt, cb) {
    var list = {};
    glob(filepath, {}, function(er, files) {
        files.forEach(function(file) {
            var path = upath.changeExt(upath.relative(upath.dirname(opt.data.root.originalPath), file), exts[upath.extname(file)]);
            var url = path;
            path = path.replace(/src\/tmpl\//, '');
            if (path.indexOf('node_modules/') > -1) {
                // package
                path = path.replace(/^node_modules\//, '').replace(/partials\//, '');
                url = url.replace(/^node_modules\//, 'packages/');
            } else {
                // local
                url = path;
                path = path.replace(/^(partials\/[\w]+\/)/, '');
            }
            var obj = zipObjectDeep([path.replace(/(\.html)/g, '').replace(/\//g, '.')], [url]);
            list = merge({}, list, obj);
        });
        cb(er, opt.fn(list));
    });
};
