"use strict";

var rework = require('rework');
var pureGrids = require('rework-pure-grids');
var mkdirp = require('mkdirp');
var fs = require('fs');

module.exports = function(config) {
    return function (cb) {
        createGrid(config.files.dest + 'custom-grid.css', config.breakpoints, function() {
            createCustomMediaVariables(config.files.dest + 'custom-media-variables.pcss', config.breakpoints, function() {
                cb();
            });
        });
    };
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
        if (map.hasOwnProperty(key)) {
            vars += '@custom-media --screen-' + key + ' ' + map[key] + ';\n';
        }
    }
    writeFile(dest, vars, cb);
}

var getDirName = require("upath").dirname;
function writeFile(path, content, cb) {
    mkdirp(getDirName(path), function (err) {
        if (err) {
            return cb(err);
        }
        fs.writeFile(path, content, cb);
    });
}
