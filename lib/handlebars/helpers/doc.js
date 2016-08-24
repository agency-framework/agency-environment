"use strict";

var fs = require('fs');
require.extensions['.css'] = function(module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var upath = require('upath');
var beautify = require('js-prettify');
var template = require('./doc/template.hbs');
var cssmin = require('cssmin');
var hljs = require('highlight.js');
hljs.configure({
    useBR: true
});

module.exports = function(assemble) {
    return function(options, cb) {
        var partial = options.data.root.partial;
        var renamedPartial = renameKey(partial);
        options.data.root.partial = renamedPartial;
        assemble.engine('.hbs').render(options.fn(), options.data.root, function(err, html) {
            if (err) {
                return cb(err);
            }
            var tmpl = template({
                previewPartial: '<span>' + renamedPartial.replace(/\//g, '</span><span class="separator">/</span><span>') + '</span>' + JSON.stringify(options),
                preview: html,
                style: cssmin(require('highlight.js/styles/github.css')),
                code: {
                    html: hljs.highlightAuto(beautifyHTML(html.trim()), ['html', 'xml']).value,
                    hbs: hljs.highlightAuto(options.fn().trim(), ['handlebars']).value,
                    json: hljs.highlightAuto(getJSONContent(assemble, options), ['json']).value
                },
                info: getRelatedPartials(assemble, options)
            });
            cb(null, tmpl);
        });
    };
};

function beautifyHTML(str) {
    return beautify.html(str, {
        indent_inner_html: true,
        indent_handlebars: true,
        condense: false,
        padcomments: false,
        indent: 1,
        unformatted: ["a", "sub", "sup", "b", "i", "u", "script"]
    });
}

function getJSONContent(assemble, options) {
    var partial = assemble.views.partials[options.data.root.partial];

    if (partial) {
        var data = assemble.views.partials[options.data.root.partial].context();
        return beautify.js(JSON.stringify(data));
    } else {
        return false;
    }

}

function getRelatedPartials(assemble, options) {
    var list = [],
        m, re = /\{\{?[\{#](mixin|extend|\>)[\s\"]+([\-\w\/]+)/g;
    while ((m = re.exec(options.fn())) !== null) {
        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }
        var partial = assemble.views.partials[m[2]];

        var relatedPartialURI = upath.join(partial.base, partial.relative);
        var relativePath;
        if (RegExp(/^node_modules\//).test(relatedPartialURI)) {
            relativePath = relatedPartialURI.replace(/^node_modules\//, '').replace(upath.extname(relatedPartialURI), '.html');
            relativePath = upath.join('packages', relativePath);
        } else {
            if (RegExp(/^src\/[^tmpl\/]/).test(relatedPartialURI)) {
                // local package
                relativePath = relatedPartialURI.replace(upath.extname(relatedPartialURI), '.html');
            } else {
                // local
                relativePath = relatedPartialURI.replace(/(src|test)\/tmpl\/partials\//, 'partials\/').replace(upath.extname(relatedPartialURI), '.html');
            }
        }
        relativePath = upath.join(options.data.root.relativeToRoot, 'docs', relativePath);
        list.push({
            title: partial.key,
            url: relativePath
        });
    }
    return list;
}


function renameKey(filename) {
    if (filename.indexOf('node_modules') !== -1) {
        filename = filename.replace(/node_modules\//, '');
        filename = filename.replace(/test\/tmpl\//, '');
    } else {
        filename = filename.replace(/(src|test)\/tmpl\//, '');
    }
    var match = filename.match(/src\/(.*)\/index/);
    if (match) {
        filename = match[1];
    } else {
        filename = filename.replace(/\/index$/, '');
    }
    return filename;
}
