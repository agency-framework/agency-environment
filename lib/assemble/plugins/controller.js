'use strict';

var through = require('through2');
var unique = require('lodash/array/unique');
var cheerio = require('cheerio');
var template = require('./controller/template.hbs');
var fs = require('fs');
var list = [];

module.exports = {
    reset: function() {
        list = [];
    },
    collect: function(ext) {
        return through.obj(function (file, enc, cb) {
            var $ = cheerio.load(file.contents.toString(enc));
            addControllersToList($('.controller[data-controller]'));
            cb();
        });
    },
    createRegistry: function() {
        list = unique(list);
        fs.writeFileSync("src/js/packages.js", template({sources: list}));
        console.log('saved file:', 'packages.js');
    }
};

function addControllersToList(nodes) {
    for (var i = 0; i < nodes.length; i++) {
        list.push(nodes.eq(i).data('controller'));
    }
}
