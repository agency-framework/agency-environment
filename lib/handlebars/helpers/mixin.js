'use strict';

var merge = require('mixin-deep');

module.exports = function (engine, assemble) {
    if(require('handlebars-layouts')(engine) !== engine.helpers.extend) {
        engine.registerHelper(require('handlebars-layouts')(engine));
    }

    return function (name, context, options) {
        if (typeof name !== 'string') {
            return '';
        }
        var ctx = {};
        var localContext = assemble.views.partials[name].context();
        if(localContext) {
            ctx = merge(ctx, localContext, getContextData(context));
        }
        return engine.helpers.extend(name, ctx, options);
    };
};

function getContextData(context) {
    if(context) {
        if(context.data) {
            return context.data.root;
        } else {
            return context;
        }
    } else {
        return {};
    }
}
