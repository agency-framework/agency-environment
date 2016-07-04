'use strict';

var through = require('through2');
var cheerio = require('cheerio');
var template = require('./controller/template.hbs');
var fs = require('fs');
var mkdirp = require('mkdirp');
var list = {};

module.exports = {
    reset: function() {
        list = {};
    },
    collect: function() {
        return through.obj(function (file, enc, cb) {
            if(file.contents) {
                var $ = cheerio.load(file.contents.toString(enc));
                addControllersToList($('.controller[data-controller]'));
            }
            cb();
        });
    },
    createRegistry: function(registry, cb) {
        writeFile((registry || {}).file || "src/js/packages.js", template({sources: list}), function() {
            console.log('saved file:', 'packages.js');
            cb();
        });
    }
};

function addControllersToList(nodes) {
    for (var i = 0; i < nodes.length; i++) {
        list[nodes.eq(i).data('controller')] = nodes.eq(i).data('controller').replace(process.env.npm_package_name, '.');
    }
}

var getDirName = require("path").dirname;
function writeFile(path, content, cb) {
    mkdirp(getDirName(path), function (err) {
        if (err) {
            return cb(err);
        }
        fs.writeFile(path, content, cb);
    });
}
