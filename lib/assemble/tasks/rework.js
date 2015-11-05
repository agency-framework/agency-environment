"use strict";

var rework = require('rework');
var pureGrids = require('rework-pure-grids');
var vars = require('rework-vars');
var mkdirp = require('mkdirp');
var fs = require('fs');

module.exports = function(dest) {
    // Why you should use relative units http://bradfrost.com/blog/post/7-habits-of-highly-effective-media-queries/#relative
    var map = {
        xs: 'screen and (min-width: 30em)',     // 480px
        sm: 'screen and (min-width: 48em)',     // 768px
        md: 'screen and (min-width: 62em)',     // 992px
        lg: 'screen and (min-width: 75em)'      // 1200px
    }

    return function (cb) {
        createGrid('src/css/generated/custom-grid.css', map, function() {
            createCustomMediaVariables('src/css/generated/custom-media-variables.css', map, function() {
                cb();
            });
        });
    }
};

function createGrid(dest, map, cb) {
    var css = rework('').use(pureGrids.units(12, {
        decimals: 4,
        includeOldIEWidths: false,
        includeReducedFractions: false,
        includeWholeNumbers: false,
        selectorPrefix: '.col-',
        mediaQueries: map
    })).toString();
    writeFile(dest, css, cb);
}

function createCustomMediaVariables(dest, map, cb) {
    var vars = '';
    for(var key in map) {
        vars += '@custom-media --screen-' + key + ' ' + map[key] + ';\n'
    }
    writeFile(dest, vars, cb);
}

var getDirName = require("path").dirname;
function writeFile(path, content, cb) {
    mkdirp(getDirName(path), function (err) {
        if (err) return cb(err)
        fs.writeFile(path, content, cb)
    });
}