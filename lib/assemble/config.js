var assemble = require('assemble');
var path = require('path');
var lazy = require('lazy-cache')(require);
lazy('mixin-object', 'mixin');

var engine = require('engine-assemble');
var layouts = require('handlebars-layouts');

assemble.engine('hbs', engine);
engine.Handlebars.registerHelper(layouts(engine.Handlebars));
//assemble.helpers(layouts(engine.Handlebars));

assemble.helper('raw', require('../handlebars/helpers/raw'));
assemble.helper('doc', require('../handlebars/helpers/doc'));
assemble.helper('test', require('../handlebars/helpers/test'));

assemble.option('renameKey', function(filepath, options) {
    return path.relative(process.cwd() + '/src/tmpl/', filepath).replace('partials/', '').replace(path.extname(filepath), '').replace(/\\/g, '/').replace('partials/', '');
});

assemble.option('mergeContext', function (view, ctx, locals) {
    var context = {};
    if(view.cwd) {
        var key = path.relative(view.cwd + '/src/tmpl', view.path).replace(path.extname(view.path), '');
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

assemble.data('**/*.{json,yml}', {
    namespace: function(filename, options) {
        return path.relative(options.cwd, filename).replace(path.extname(filename), '');
    },
    cwd: process.cwd() + '/src/data/'
});

module.exports = assemble;