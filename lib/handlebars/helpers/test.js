"use strict";
var async = require('async');
var engine = require('engine-assemble');
var assemble = require('assemble');

module.exports = function(options, cb) {

    var ctx = this.context;
    var test = options.fn();
    console.log('HUHU', options.fn());

    var data = engine.Handlebars.createFrame(options.data);
    console.log(assemble.compile(test)(data.root));
    cb(null, assemble.compile(test)(options.data.root));
//    var posts = this.app.views.posts;
//    var keys = Object.keys(posts);

//    async.map(keys, function (key, next) {
//        next(null, '');
//    }, function (err, res) {
//        if (err) return cb(err);
//        console.log(res)
//        cb(null, res.join('\n'));
//    });
};