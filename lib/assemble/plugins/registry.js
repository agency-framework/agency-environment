'use strict';

var through = require('through2');
var cheerio = require('cheerio');
var controllerTemplate = require('./registry/controller.hbs');
var partialTemplate = require('./registry/partial.hbs');
var fs = require('fs');
var mkdirp = require('mkdirp');
var filter = require('lodash/filter');

var uniqBy = require('lodash/uniqBy');
var upath = require('upath');

var controllerList = [],
    partialList = [];

module.exports = {
    reset: function() {
        controllerList = [];
        partialList = [];
    },
    collect: function() {
        return through.obj(function(file, enc, cb) {
            if (file.contents) {
                var $ = cheerio.load(file.contents.toString(enc));
                addControllersToList($('.controller[data-controller]'));
                addPkgToList($('.pkg[data-pkg]'));
                addPartialsToList($('.partial[data-partial]'));
            }
            cb();
        });
    },
    createControllerRegistry: function(config, registry, cb) {
        // controller
        controllerList = uniqBy(controllerList, 'name');
        writeFile((registry || {}).file || config.js || "src/js/packages.js", controllerTemplate({
            sources: controllerList
        }), function() {
            console.log('saved file:', 'packages.js');
            cb();
        });
    },
    createPartialRegistry: function(config, registry, cb) {
        var excludesRegExp = RegExp(config.pcssExclude.join('|').replace(/\\/g, '\\\\'));
        var dest = upath.normalize(config.pcss || upath.normalize('src/pcss/partials.pcss'));
        // partial
        partialList = uniqBy(partialList, 'name');
        var sources = [];
        filter(partialList, function(entry) {
            if (!excludesRegExp.test(entry.name)) {
                return entry;
            }
        }).forEach(function(entry) {
            if (fs.existsSync(entry.filePath)) {
                sources.push(entry);
                console.log('[' + 'task'.gray + '][' + 'handlebars'.gray + ']', 'added'.bold.green, entry.name.gray, 'import to', upath.basename(dest).gray);
            } else {
                console.log('[' + 'task'.gray + '][' + 'handlebars'.gray + ']', 'can\'t find'.bold.red, entry.name.gray);
            }

        });
        writeFile(dest, partialTemplate({
            sources: sources
        }), function() {
            console.log('saved file:', 'partials.pcss');
            cb();
        });
    }
};

function addControllersToList(nodes) {
    var controller, id;
    for (var i = 0; i < nodes.length; i++) {
        controller = nodes.eq(i).data('controller');
        id = controller === process.env.npm_package_name ? upath.join(controller, 'default') : controller;
        id = id.replace(process.env.npm_package_name, upath.normalizeSafe('../../src'));
        controllerList.push({
            name: controller,
            id: id
        });
    }
}


function addPartialsToList(nodes) {
    var partial;
    for (var i = 0; i < nodes.length; i++) {
        partial = nodes.eq(i).data('partial');
        partialList.push({
            name: partial,
            path: upath.normalizeSafe('./partials/' + partial + '.pcss'),
            filePath: upath.normalizeSafe('./src/pcss/partials/' + partial + '.pcss')
        });
    }
}

function addPkgToList(nodes) {
    var partial, filePath, path;
    for (var i = 0; i < nodes.length; i++) {
        path = partial = nodes.eq(i).data('pkg');
        filePath = partial.split('/');
        if (filePath.length > 1) {
            var tmp = filePath.pop();
            filePath = filePath.concat(['pcss', tmp + '.pcss']);
            path += '.pcss';
        } else {
            filePath = filePath.concat('pcss', 'default.pcss');
        }
        partialList.push({
            name: partial,
            path: path,
            filePath: './' + upath.join('node_modules', filePath.join('/'))
        });
    }
}

var getDirName = upath.dirname;

function writeFile(path, content, cb) {
    mkdirp(getDirName(path), function(err) {
        if (err) {
            return cb(err);
        }
        fs.writeFile(path, content, cb);
    });
}
