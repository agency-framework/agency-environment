"use strict";

var assemble = require('assemble')();
var upath = require('upath');
var lazy = require('lazy-cache')(require);
lazy('mixin-object', 'mixin');

var engine = require('engine-handlebars');
assemble.engine('hbs', engine);

engine.Handlebars.registerHelper(require('template-helpers')());
// engine.Handlebars.registerHelper(layouts(engine.Handlebars));

assemble.helper('mixin', require('../handlebars/helpers/mixin')(engine.Handlebars, assemble));
assemble.asyncHelper('raw', require('../handlebars/helpers/raw'));
assemble.asyncHelper('glob', require('../handlebars/helpers/glob'));
assemble.asyncHelper('doc', require('../handlebars/helpers/doc')(assemble));
assemble.asyncHelper('test', require('../handlebars/helpers/test'));

assemble.onLoad(/\.hbs/, function(view, next) {

  // parse front matter from `view.content`
  next();
});

assemble.partials.option('renameKey', function(fp) {
    if (!!upath.extname(fp)) {
        return upath.relative(process.cwd() + '/src/tmpl/partials/', fp).replace(upath.extname(fp), '');
    }
    // console.log(fp);
    return fp;
});
assemble.layouts.option('renameKey', function(fp) {
    if (!!upath.extname(fp)) {
        return upath.relative(process.cwd() + '/src/tmpl/partials/', fp).replace(upath.extname(fp), '');
    }
    return fp;
});

assemble.preLayout( /./, function ( view, next ) {
    if ( !view.layout && !view.isPartial ) {
        if (view.key.indexOf('partials/') > -1) {
            view.layout = 'layouts/documentation';
        } else {
            view.layout = 'layouts/default';
        }        
    }
    next();
} );

assemble.option('mergeContext', function(view, locals) {
    // console.log(JSON.parse(JSON.stringify(view)));
    var context = {};
    if (upath.extname(view.relative) === '.hbs') {

        var key = view.relative.replace(upath.extname(view.relative), '');
        context.partial = key.replace('partials/', '');
        if (view.base.indexOf('partials/') > -1) {
            key = 'partials/' + view.relative.replace(upath.extname(view.relative), '');
        }

        if (this.cache.data[key]) {
            lazy.mixin(context, this.cache.data[key]);
        }
    }

    lazy.mixin(context, view.locals);
    lazy.mixin(context, view.data);
    lazy.mixin(context, view.context());
    lazy.mixin(context, locals);

    context.assets = this.options.assets;

    var relativeToRoot = upath.relative(upath.dirname(view.key), view.base);
    if(relativeToRoot !== '') {
        context.relativeToRoot = relativeToRoot;
    } else {
        context.relativeToRoot = '.';
    }

    return context;
});

module.exports = assemble;
