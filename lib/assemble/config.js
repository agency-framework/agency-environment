"use strict";

var assemble = require('assemble')();
var upath = require('upath');
var lazy = require('lazy-cache')(require);
lazy('mixin-object', 'mixin');

var engine = require('engine-handlebars');
var layouts = require('handlebars-layouts');

assemble.engine('hbs', engine);

engine.Handlebars.registerHelper(require('template-helpers')());
engine.Handlebars.registerHelper(layouts(engine.Handlebars));


//assemble.helpers(layouts(engine.Handlebars));

assemble.asyncHelper('raw', require('../handlebars/helpers/raw'));
assemble.asyncHelper('glob', require('../handlebars/helpers/glob'));
assemble.asyncHelper('doc', require('../handlebars/helpers/doc'));
assemble.asyncHelper('test', require('../handlebars/helpers/test'));

// assemble.option('renameKey', function(filepath) {
//     // console.log(upath.relative(process.cwd() + '/src/tmpl/', filepath).replace('partials/', '').replace(upath.extname(filepath), '').replace('partials/', ''));
//     return upath.relative(process.cwd() + '/src/tmpl/', filepath).replace('partials/', '').replace(upath.extname(filepath), '').replace('partials/', '');
// });


assemble.partials.option('renameKey', function(fp) {
    if (!!upath.extname(fp)) {
        return upath.relative(process.cwd() + '/src/tmpl/partials/', fp).replace(upath.extname(fp), '');
    }
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
        view.layout = 'layouts/default';
    }
    next();
} );

assemble.option('mergeContext', function(view, locals) {
    var context = {};

    if (upath.extname(view.relative) === '.hbs') {
        var key = view.relative.replace(upath.extname(view.relative), '');

        if (view.base.indexOf('partials/') > -1) {
            key = 'partials/' + view.relative.replace(upath.extname(view.relative), '');
        }
        if (this.cache.data[key]) {
            lazy.mixin(context, this.cache.data[key]);
        }
    }


    lazy.mixin(context, view.locals);
    lazy.mixin(context, view.data);
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
