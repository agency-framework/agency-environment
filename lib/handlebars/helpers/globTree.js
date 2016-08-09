"use strict";

var glob = require('glob');
var fs = require('fs');
var upath = require('upath');
var exts = require('ext-map');
var zipObjectDeep = require('lodash/zipObjectDeep');
var merge = require('mixin-deep');

module.exports = function(filepath, ignore, opt, cb) {
    var list = {};
    if (!cb) {
        cb = opt;
        opt = ignore;
        ignore = [];
    }
    fs.stat(filepath, function(stat) {
        if (stat) {
            glob(filepath, {
                ignore: ignore
            }, function(er, files) {
                files.forEach(function(file) {
                    var path = upath.changeExt(upath.relative(upath.dirname(opt.data.root.originalPath), file), exts[upath.extname(file)]);
                    var url = path;
                    path = path.replace(/((src|test)\/tmpl\/|^src\/)/, '');
                    if (/node_modules\//.test(path)) {
                        // package
                        url = url.replace(/^node_modules\//, 'packages/');
                        path = path.replace(/^node_modules\//, '');
                        path = path.replace(/(.*)[\/]+(.*)\/index\.html$/, '$1/$2/index');
                    } else {
                        // local
                        url = url.replace(/((src|test)\/tmpl\/)/, '');
                        path = path.replace(/^(partials\/[\w]+\/)/, '');
                        path = path.replace(/(\.html)/g, '');
                    }
                    var obj = zipObjectDeep([path.replace(/\//g, '.')], [url]);
                    list = merge({}, list, obj);
                });
                cb(er, opt.fn(list));
            });

        } else {
            cb(null, opt.fn(list));
        }
    });
};
