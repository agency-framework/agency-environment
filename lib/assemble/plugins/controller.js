'use strict';

var through = require('through2');
var cheerio = require('cheerio');
var template = require('./controller/template.hbs');
var fs = require('fs');
var mkdirp = require('mkdirp');
var list = [];
var uniqBy = require('lodash/uniqBy');
var upath = require('upath');

module.exports = {
    reset: function() {
        list = [];
    },
    collect: function() {
        return through.obj(function(file, enc, cb) {
            if (file.contents) {
                var $ = cheerio.load(file.contents.toString(enc));
                addControllersToList($('.controller[data-controller]'));
            }
            cb();
        });
    },
    createRegistry: function(dest, registry, cb) {
        list = uniqBy(list, 'name');
        writeFile((registry || {}).file || dest || "src/js/packages.js", template({
            sources: list
        }), function() {
            console.log('saved file:', 'packages.js');
            cb();
        });
    }
};

function addControllersToList(nodes) {
    var controller, id;
    for (var i = 0; i < nodes.length; i++) {
        controller = nodes.eq(i).data('controller');
        id = controller === process.env.npm_package_name ? upath.join(controller , 'default') : controller;
        id = id.replace(process.env.npm_package_name, '../../src');
        list.push({
            name: controller,
            id: id
        });
    }
}

var getDirName = require("path").dirname;

function writeFile(path, content, cb) {
    mkdirp(getDirName(path), function(err) {
        if (err) {
            return cb(err);
        }
        fs.writeFile(path, content, cb);
    });
}
