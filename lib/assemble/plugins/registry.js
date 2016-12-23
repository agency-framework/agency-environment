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
    criticalStyleClass = 'critical-style';

/**
 * Assemble / Plugins / Registry
 * Erstellt einzelne Import-Listen für Javascript und PCSS.
 * File                        | Selector
 * ----------------------------|---------
 * js/packages.js              | .controller[data-controller]
 * pcss/partials.pcss          | .partial[data-partial] | .pkg[data-pkg]
 * pcss/partials.critical.pcss | .partial[data-partial] | .pkg[data-pkg]
 *
 * @TODO Implementierung für require.import über Klasse auf Controller, analog zu PCSS.
 *
 */
function Registry() {
    this.controllerList = [];
    this.nameList = [];
}
Registry.prototype.srcPath = 'src';
/**
 * Generate packages.js, partials.pcss and partials.critical.pcss
 */
Registry.prototype.prepare = function(config, cb) {
    config = config || {};
    clean(config);
    writeFile(config.js || upath.join(this.srcPath, defaultDestJS), '', function() {
        writeFile(config.pcss || upath.join(this.srcPath, defaultDestPCSS), '', function() {
            writeFile(config.pcssCritical || upath.join(this.srcPath, criticalDestPCSS), '', cb);
        });
    });
};

Registry.prototype.reset = function() {
    this.controllerList = [];
    this.nameList = [];
};

Registry.prototype.collect = function() {
    var scope = this;
    return through.obj(function(file, enc, cb) {
        if (file.contents) {
            var $ = cheerio.load(file.contents.toString(enc));
            addControllersToList(scope, $('.controller[data-controller]'));
            addPkgToList(scope, $('.pkg[data-pkg]'));
            addPartialsToList(scope, $('.partial[data-partial]'));
        }
        cb();
    });
};
Registry.prototype.createControllerRegistry = function(config, registry, cb) {
    // controller
    this.controllerList = uniqBy(this.controllerList, 'name');
    writeFile((registry || {}).file || config.js || upath.join(this.srcPath, defaultDestJS), controllerTemplate({
        sources: this.controllerList
    }), function() {
        console.log('saved file:', 'packages.js');
        cb();
    });
};
Registry.prototype.createPartialRegistry = function(config, registry, cb) {
    var excludesRegExp = RegExp(config.pcssExcludes.join('|').replace(/\\/g, '\\\\'));
    // partial
    this.nameList = uniqBy(this.nameList, 'name');
    var sources = {
        default: [],
        critical: []
    };
    filter(this.nameList, function(entry) {
        if (!excludesRegExp.test(entry.name)) {
            return entry;
        }
    }).forEach(function(entry) {
        if (fs.existsSync(entry.filePath)) {
            sources[entry.critical ? 'critical' : 'default'].push(entry);
            console.log('[' + 'task'.gray + '][' + 'handlebars'.gray + ']', 'added'.bold.green, entry.name.gray, 'import to', upath.basename(entry.critical ? criticalDestPCSS : defaultDestPCSS).gray);
        } else {
            console.log('[' + 'task'.gray + '][' + 'handlebars'.gray + ']', 'can\'t find'.bold.red, entry.name.gray);
        }
    });
    writeFile(upath.normalize(config.pcss || upath.join(this.srcPath, defaultDestPCSS)), partialTemplate({
        sources: sources.default
    }), function() {
        console.log('saved file:', defaultDestPCSS);
        writeFile(upath.normalize(config.pcssCritical || upath.join(this.srcPath, criticalDestPCSS)), partialTemplate({
            sources: sources.critical
        }), function() {
            console.log('saved file:', criticalDestPCSS);
            cb();
        });
    });
};

module.exports = new Registry();

function addControllersToList(scope, nodes) {
    var controller, id;
    for (var i = 0; i < nodes.length; i++) {
        controller = nodes.eq(i).data('controller');
        id = controller === process.env.npm_package_name ? upath.join(controller, 'default') : controller;
        id = id.replace(process.env.npm_package_name, upath.normalizeSafe(upath.join('..', '..', 'src')));
        scope.controllerList.push({
            name: controller,
            id: id
        });
    }
}


function addPartialsToList(scope, nodes) {
    var originPath, node;
    for (var i = 0; i < nodes.length; i++) {
        node = nodes.eq(i);
        originPath = node.data('partial');
        scope.nameList.push({
            critical: node.hasClass(criticalStyleClass),
            name: originPath,
            path: upath.normalizeSafe('./' + upath.join('partials', originPath + '.pcss')),
            filePath: upath.normalizeSafe('./' + upath.join(scope.srcPath, 'pcss/partials', originPath + '.pcss'))
        });
    }
}

function addPkgToList(scope, nodes) {
    var originPath, filePath, path, node;
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
        scope.nameList.push({
            critical: node.hasClass(criticalStyleClass),
            name: originPath,
            path: path,
            filePath: upath.normalizeSafe(filePath)
        });
    }
}

function writeFile(path, content, cb) {
    mkdirp(getDirName(path), function(err) {
        if (err) {
            return cb(err);
        }
        fs.writeFile(path, content, cb);
    });
}

function clean(config) {
    [config.pcss || upath.join(this.srcPath, defaultDestPCSS),
        config.pcssCritical || upath.join(this.srcPath, criticalDestPCSS)
    ].forEach(fs.unlink);
}
