"use strict";

module.exports = function() {
    var args = arguments;

    var list = [];
    for(var i = 0, l = args.length - 2; i < l; i++) {
        list.push(args[i]);
    }
    args[args.length-1](null, list.join(''));
};
