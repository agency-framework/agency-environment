"use strict";

module.exports = function(webpack) {
    return new webpack.optimize.DedupePlugin();
};
