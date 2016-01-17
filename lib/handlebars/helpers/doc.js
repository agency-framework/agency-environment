"use strict";

var fs = require('fs');
require.extensions['.css'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var assemble = require('assemble')();
var delims = require('delims');
var upath = require('upath');
var grayMatter = require('gray-matter');
var beautify = require('js-prettify');
var template = require('./doc/template.hbs');
var cssmin = require('cssmin');
var htmlmin = require('htmlmin');
var hljs = require('highlight.js');
hljs.configure({useBR: true});

module.exports = function(options, cb) {
    var html =  assemble.engine('.hbs').compile(options.fn())(options.data.root);
    
    var tmpl = template({
        preview: html,
        style: cssmin(require('highlight.js/styles/github.css')),
        code: {
            hbs: hljs.highlightAuto(options.fn().trim(), ['handlebars']).value
        }
        // info: info
    });

    cb(null, tmpl);
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

function getYamlContent(content) {
    var delimiters = new delims().create(['---', '---']).evaluate;
    var yamlContent = content.match(delimiters);
    if(yamlContent && yamlContent.length === 3) {
        return yamlContent[1];
    } else {
        return '';
    }
}

function getJSONContent(content) {
    var data = grayMatter(content).data;
    return beautify.js(JSON.stringify(data));
}

function readHBS(src) {
    return fs.readFileSync(src, 'utf8');
}

function getRelatedPartialAndExtendUrls(str, ctx) {
    var list = {integrated:[], extended:[]};
    var srcFile = '';
    var destFile = '';
    var relative = '';

    var re = /\{\{?[\{#](partial|extend)[\s\"]+([\-\w\/]+)/g;
    var m;

    while ((m = re.exec(str)) !== null) {
        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }

        srcFile = ctx.originalPath;console.log('huch', ctx);
        destFile = ctx[m[2]].src.path;
        relative = upath.relative(upath.dirname(srcFile),destFile).replace(upath.extname(destFile),'.html');
        if(m[1] === 'partial') {
            list.integrated.push({url:relative, title: m[2]});
        } else {
            list.extended.push({url:relative, title: m[2]});
        }
    }

    return list;
}
