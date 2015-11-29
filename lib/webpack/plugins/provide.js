"use strict";

module.exports = function(webpack, config) {
    return new webpack.ProvidePlugin(config);
};