"use strict";

var assemble = require('assemble');
var upath = require('upath');
var lazy = require('lazy-cache')(require);
lazy('mixin-object', 'mixin');

var engine = require('engine-assemble');
var layouts = require('handlebars-layouts');

assemble.engine('hbs', engine);
engine.Handlebars.registerHelper(layouts(engine.Handlebars));
//assemble.helpers(layouts(engine.Handlebars));

assemble.asyncHelper('raw', require('../handlebars/helpers/raw'));
assemble.asyncHelper('doc', require('../handlebars/helpers/doc'));
assemble.asyncHelper('test', require('../handlebars/helpers/test'));

assemble.option('renameKey', function(filepath) {
    return upath.relative(process.cwd() + '/src/tmpl/', filepath).replace('partials/', '').replace(upath.extname(filepath), '').replace('partials/', '');
});

assemble.option('mergeContext', function (view, ctx) {
    var context = {};
    if(upath.extname(view.relative) === '.hbs') {
        var key = view.relative.replace(upath.extname(view.relative), '');
        if(view.base.indexOf('partials/') > -1) {
            key = 'partials/' + view.relative.replace(upath.extname(view.relative), '');
        }
        if(this.cache.data[key]) {
            lazy.mixin(context, this.cache.data[key]);
        }
    }
//    console.log(view.orig.match(/{{partial\s"([\w\/]+).*}}/g));
//    console.log('------------------');
    if (this.enabled('preferLocals')) {
        lazy.mixin(context, view.options);
        lazy.mixin(context, view.data);
        lazy.mixin(context, view.locals);
    } else {
        lazy.mixin(context, view.locals);
        lazy.mixin(context, view.data);
        lazy.mixin(context, view.options);
    }
    lazy.mixin(context, this.mergePartials(ctx));
    lazy.mixin(context, this.cache._context.partials);
    return context;
});

module.exports = assemble;
