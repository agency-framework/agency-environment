"use strict";

var ifaces = require('os').networkInterfaces();
var lookupIpAddress = null;
module.exports = function(ip) {
    if(ip === true) {
        for (var dev in ifaces) {
            if (ifaces.hasOwnProperty(dev)) {
                if (dev !== "en1" && dev !== "en0") {
                    continue;
                }

                ifaces[dev].forEach(function (details) {                    
                    if (details.family === 'IPv4') {
                        lookupIpAddress = details.address;
                        return;
                    }
                });
                if (lookupIpAddress) {
                    break;
                }
            }
        }
        return lookupIpAddress;
    } else {
        return ip;
    }
};
