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

var defaultDestJS = upath.normalize('js/packages.js'),
    defaultDestPCSS = upath.normalize('pcss/packages.pcss');

module.exports = {

    srcPath: 'src',

    /**
     * Generate packages.js and partials.pcss
     */
    prepare: function(config, cb) {
        config = config || {};
        writeFile(config.js || upath.join(this.srcPath, defaultDestJS), '', function() {
            writeFile(config.pcss || upath.join(this.srcPath, defaultDestPCSS), '', cb);
        });
    },

    reset: function() {
        controllerList = [];
        partialList = [];
    },
    collect: function() {
        var scope = this;
        return through.obj(function(file, enc, cb) {
            if (file.contents) {
                var $ = cheerio.load(file.contents.toString(enc));
                addControllersToList(scope, $('.controller[data-controller]'));
                addPkgToList($('.pkg[data-pkg]'));
                addPartialsToList(scope, $('.partial[data-partial]'));
            }
            cb();
        });
    },
    createControllerRegistry: function(config, registry, cb) {
        // controller
        controllerList = uniqBy(controllerList, 'name');
        writeFile((registry || {}).file || config.js || upath.join(this.srcPath, defaultDestJS), controllerTemplate({
            sources: controllerList
        }), function() {
            console.log('saved file:', 'packages.js');
            cb();
        });
    },
    createPartialRegistry: function(config, registry, cb) {
        var excludesRegExp = RegExp(config.pcssExclude.join('|').replace(/\\/g, '\\\\'));
        var dest = upath.normalize(config.pcss || upath.join(this.srcPath, defaultDestPCSS));
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

function addControllersToList(scope, nodes) {
    var controller, id;
    for (var i = 0; i < nodes.length; i++) {
        controller = nodes.eq(i).data('controller');
        id = controller === process.env.npm_package_name ? upath.join(controller, 'default') : controller;
        id = id.replace(process.env.npm_package_name, upath.normalizeSafe(upath.join('..', '..', 'src')));
        controllerList.push({
            name: controller,
            id: id
        });
    }
}


function addPartialsToList(scope, nodes) {
    var partial;
    for (var i = 0; i < nodes.length; i++) {
        partial = nodes.eq(i).data('partial');
        partialList.push({
            name: partial,
            path: upath.normalizeSafe('./' + upath.join('partials', partial + '.pcss')),
            filePath: upath.normalizeSafe('./' + upath.join(scope.srcPath, 'pcss/partials', partial + '.pcss'))
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
        if (path.indexOf(process.env.npm_package_name)> -1) {
            filePath.shift();
            filePath = './' + upath.join('src', filePath.join('/'));
        } else {
            filePath = './' + upath.join('node_modules', filePath.join('/'));
        }
        partialList.push({
            name: partial,
            path: path,
            filePath: upath.normalizeSafe(filePath)
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
