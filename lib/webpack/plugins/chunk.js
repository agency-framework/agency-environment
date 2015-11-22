"use strict";

module.exports = function(webpack, config) {
    return new webpack.optimize.CommonsChunkPlugin(config.main, config.packages);
};