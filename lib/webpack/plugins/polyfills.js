"use strict";

module.exports = function() {
    return new (require('webpack-polyfills-plugin'))([
        '_enqueueMicrotask',
        'Promise',
        'Array/prototype/find'
    ]);
};