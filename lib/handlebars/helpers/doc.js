"use strict";

var engine = require('engine-assemble');
var handlebars = require('handlebars');
var beautify = require('js-prettify');
var template = require('./doc/template.hbs');
var hljs = require('highlight.js');
hljs.configure({useBR: true});


module.exports = function(options) {
//    console.log(engine.Handlebars.compile(options.fn())(options.data.root));
    var html =  engine.Handlebars.compile(options.fn())(options.data.root).trim();
    var markup = beautifyHTML(html);
    console.log(html);
//console.log( engine.compile(options.fn(), options.data.root));

    return template({
        preview: html,
        code: {
            html: hljs.highlightAuto(markup, ['html', 'xml']).value
        }
    });
//    console.log(html);
//    console.log(markup);
////    console.log(options.data.root.options);
////    console.log(engine.Handlebars.compile(options.fn())(options.data.root));
////    console.log(engine.Handlebars.precompile(options.fn()));
////    console.log(engine.Handlebars.precompile(options.fn(), {explicitPartialContext: true}));
////    console.log(options.fn());
//    console.log('-----------');
//    return engine.Handlebars.compile(options.fn())(options.data.root);
//    return options.fn();
};

function beautifyHTML(str) {
    console.log();
    return beautify.html(str, {
        indent_inner_html: true,
        indent_handlebars: true,
        condense: false,
        padcomments: false,
        indent: 1,
        unformatted: ["a", "sub", "sup", "b", "i", "u", "script"]
    });
}