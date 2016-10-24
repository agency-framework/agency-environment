"use strict";

var assemble = require('assemble')();
var upath = require('upath');
var merge = require('mixin-deep');
var engine = require('engine-handlebars');

// Assemble Handlebars pre Config
assemble.engine('hbs', engine);
engine.Handlebars.registerHelper(require('template-helpers')());
// engine.Handlebars.registerHelper(layouts(engine.Handlebars));

// Define default Handlebars-Helper
assemble.helper('mixin', require('../handlebars/helpers/mixin')(engine.Handlebars, assemble));
assemble.asyncHelper('raw', require('../handlebars/helpers/raw'));
assemble.asyncHelper('glob', require('../handlebars/helpers/glob'));
assemble.asyncHelper('globTree', require('../handlebars/helpers/globTree'));
assemble.asyncHelper('base64', require('../handlebars/helpers/base64'));
// assemble.asyncHelper('test', require('../handlebars/helpers/test'));

// Renames (default, partials, layouts)

assemble.option('renameKey', function (filename, content, options) {
    if (upath.extname(filename) === '.json') {
        return options.namespace(filename, options);
    }
    return filename;
});

assemble.partials.option('renameKey', function (fp, view) {
    if (view) {
        return upath.relative(view.base, fp).replace(upath.extname(fp), '');
    }
    return fp;
});
assemble.layouts.option('renameKey', function (fp, view) {
    if (view) {
        return upath.relative(view.base, fp).replace(upath.extname(fp), '');
    }
    return fp;
});

assemble.preRender(/\.hbs$/, mergeContext(assemble));

function mergeContext(app, locals) {
    return function (view, next) {
        var key = view.relative.replace(upath.extname(view.relative), '');
        view.layout = view.data.layout || view.layout;
        view.data = merge({
            relativeToRoot: getRelativeToRoot(view),
            partial: key.replace('partials/', '')
        }, locals, view.data, app.cache.data[key] || {});
        next();
    };
}

function getRelativeToRoot(view) {
    var relativeToRoot = upath.relative(upath.dirname(view.key), view.base).replace(upath.extname(view.key), '') || '.';
    if (view.options.plural === 'docs') {
        relativeToRoot = relativeToRoot + '\/..';
    } else if (view.options.plural === 'src-docs') {
        relativeToRoot = upath.relative('\/docs\/' + upath.join(upath.dirname(view.key.replace(process.cwd(), ''))), '/');
    } else if (view.options.plural === 'docs-packages' || view.options.plural === 'partial-docs' || view.options.plural === 'docs-partials') {
        relativeToRoot = upath.relative('\/docs\/' + upath.join(upath.dirname(view.key.replace(/(src|test)\/tmpl\//, '').replace(process.cwd(), ''))), '/');
    }
    if (relativeToRoot !== '') {
        return relativeToRoot + '\/';
    } else {
        return '.\/';
    }
    return relativeToRoot;
}

module.exports = assemble;
