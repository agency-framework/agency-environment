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
var getDirName = upath.dirname;

var defaultDestJS = upath.normalize('js/packages.js'),
    defaultDestPCSS = upath.normalize('pcss/partials.pcss'),
    criticalDestPCSS = upath.normalize('pcss/partials.critical.pcss'),
    criticalDataAttribute = 'criticalStyle',
    controllerSelector = '.controller[data-controller]',
    partialSelector = '.partial[data-partial]',
    pkgSelector = '.pkg[data-pkg]';

/**
 * Assemble / Plugins / Registry
 * Erstellt einzelne Import-Listen für Javascript und PCSS.
 * File                             | Selector
 * ---------------------------------|-----------------------------------------
 * js/packages.js                   | .controller[data-controller]
 * js/packages.docs.js              | .controller[data-controller]
 * pcss/partials.pcss               | .partial[data-partial] | .pkg[data-pkg]
 * pcss/partials.critical.pcss      | .partial[data-partial] | .pkg[data-pkg]
 * pcss/partials.docs.pcss          | .partial[data-partial] | .pkg[data-pkg]
 * pcss/partials.critical.docs.pcss | .partial[data-partial] | .pkg[data-pkg]
 *
 * @TODO Implementierung für require.import über Klasse auf Controller, analog zu PCSS.
 *
 */
function Registry() {
    this.controllerList = [];
    this.nameList = [];
}
Registry.prototype.srcPath = 'src';
Registry.prototype.fileDataList = [];

Registry.prototype.reset = function() {
    this.controllerList = [];
    this.nameList = [];
};

Registry.prototype.collect = function() {
    var scope = this;
    return through.obj(function(file, enc, cb) {
        if (file.contents) {
            var $ = cheerio.load(file.contents.toString(enc));
            scope.fileDataList.push({
                file: upath.relative(process.cwd(), file.path),
                controllers: getControllersList(scope, $(controllerSelector)),
                partials: getPartialsList(scope, $(partialSelector)).concat(getPkgList(scope, $(pkgSelector)))
            });
        }
        cb();
    });
};

Registry.prototype.createRegistries = function(cb) {
    useConfig(this.configs, function(config, next) {
        var controllers = [],
            partials = [];
        var includesRegExp = RegExp(config.includes.join('|').replace(/\\/g, '\\\\')),
            excludesRegExp = RegExp(config.excludes.join('|').replace(/\\/g, '\\\\'));
        filter(this.fileDataList, function(entry) {
            if ((includesRegExp.test(entry.file) && config.includes.length > 0) || !config.includes.length) {
                if (!(excludesRegExp.test(entry.file) && config.excludes.length > 0) || !config.excludes.length) {
                    return entry;
                }
            }
        }).forEach(function(entry) {
            if (entry.controllers) {
                controllers = controllers.concat(entry.controllers);
            }
            if (entry.partials) {
                partials = partials.concat(entry.partials);
            }
        });
        createRegistryController(controllers, this, config, function() {
            createRegistryPartials(partials, this, config, next);
        });
    }.bind(this), cb);
};

function createRegistryController(list, scope, config, cb) {
    // controller
    list = uniqBy(list, 'name');
    writeFile(config.js || upath.join(scope.srcPath, defaultDestJS), controllerTemplate({
        sources: list
    }), function() {
        console.log('[' + 'task'.gray + '][' + 'handlebars'.gray + ']', 'saved file:'.bold.green, upath.basename(config.js).gray);
        cb();
    });
}

function createRegistryPartials(list, scope, config, cb) {
    config.pcssExcludes = config.pcssExcludes || [];
    var excludesRegExp = RegExp(config.pcssExcludes.join('|').replace(/\\/g, '\\\\'));
    list = uniqBy(list, 'name');
    var sources = {
        default: [],
        critical: []
    };
    var path = upath.normalize(config.pcss || upath.join(this.srcPath, defaultDestPCSS));
    var criticalPath = upath.normalize(config.pcssCritical || upath.join(this.srcPath, criticalDestPCSS));
    filter(list, function(entry) {
        if (!excludesRegExp.test(entry.name) || !config.pcssExcludes.length) {
            return entry;
        }
    }).forEach(function(entry) {
        if (fs.existsSync(entry.filePath)) {
            sources[entry.critical ? 'critical' : 'default'].push(entry);
        }
    });
    writeFile(path, partialTemplate({
        sources: sources.default
    }), function() {
        console.log('[' + 'task'.gray + '][' + 'handlebars'.gray + ']', 'saved file:'.bold.green, upath.basename(path).gray);
        writeFile(criticalPath, partialTemplate({
            sources: sources.critical
        }), function() {
            console.log('[' + 'task'.gray + '][' + 'handlebars'.gray + ']', 'saved file:'.bold.green, upath.basename(criticalPath).gray);
            cb();
        });
    });
}

Registry.prototype.setConfig = function(configs) {
    useConfig(configs, function(config, next) {
        config.includes = config.includes || [];
        config.excludes = config.excludes || [];
        next();
    });
    this.configs = configs;
    createDefaultFiles(configs);
};

module.exports = new Registry();

function useConfig(configs, cb, completeCallback) {
    var tmpConfigs = [].concat(configs);
    useConfigLoop(tmpConfigs, cb, completeCallback);
}

function useConfigLoop(tmpConfigs, cb, completeCallback) {
    if (tmpConfigs.length > 0) {
        var config = tmpConfigs.shift();
        cb(config, function() {
            useConfigLoop(tmpConfigs, cb, completeCallback);
        });
    } else if (completeCallback) {
        completeCallback();
    }
}


function getControllersList(scope, nodes) {
    var controller, id, list = [];
    for (var i = 0; i < nodes.length; i++) {
        controller = nodes.eq(i).data('controller');
        id = controller === process.env.npm_package_name ? upath.join(controller, 'default') : controller;
        id = id.replace(process.env.npm_package_name, upath.normalizeSafe(upath.join('..', '..', 'src')));
        list.push({
            name: controller,
            id: id
        });
    }
    return list;
}


function getPartialsList(scope, nodes, forceCritical) {
    var originPath, node, list = [];
    for (var i = 0; i < nodes.length; i++) {
        node = nodes.eq(i);
        originPath = node.data('partial');
        var critical = false;
        if (forceCritical) {
            critical = true;
        } else if (node.data(criticalDataAttribute)) {
            critical = true;
            list = list.concat(getPartialsList(scope, node.find(partialSelector), true));
        }
        list.push({
            critical: critical,
            name: originPath,
            path: upath.normalizeSafe('./' + upath.join('partials', originPath + '.pcss')),
            filePath: upath.normalizeSafe('./' + upath.join(scope.srcPath, 'pcss/partials', originPath + '.pcss'))
        });
    }
    return list;
}

function getPkgList(scope, nodes, forceCritical) {
    var originPath, filePath, path, node, list = [];
    for (var i = 0; i < nodes.length; i++) {
        node = nodes.eq(i);
        path = originPath = node.data('pkg');
        filePath = originPath.split('/');
        if (filePath.length > 1) {
            var tmp = filePath.pop();
            filePath = filePath.concat(['pcss', tmp + '.pcss']);
            path += '.pcss';
        } else {
            filePath = filePath.concat('pcss', 'default.pcss');
        }
        if (path.indexOf(process.env.npm_package_name) > -1) {
            filePath.shift();
            filePath = './' + upath.join('src', filePath.join('/'));
        } else {
            filePath = './' + upath.join('node_modules', filePath.join('/'));
        }
        var critical = false;
        if (forceCritical) {
            critical = true;
        } else if (node.data(criticalDataAttribute)) {
            critical = true;
            list = list.concat(getPkgList(scope, node.find(pkgSelector), true));
        }
        list.push({
            critical: critical,
            name: originPath,
            path: path,
            filePath: upath.normalizeSafe(filePath)
        });
    }
    return list;
}

function createDefaultFiles(configs, cb) {

    configs.forEach(function(config) {
        writeFile(upath.normalize(config.pcss), '', function() {
            writeFile(upath.normalize(config.pcssCritical), '', function() {
                if (cb) {
                    cb();
                }
            });
        });
    });

}

function writeFile(path, content, cb) {
    mkdirp(getDirName(path), function(err) {
        if (err) {
            return cb(err);
        }
        fs.writeFile(path, content, cb);
    });
}
