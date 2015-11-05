"use strict";

var ifaces = require('os').networkInterfaces();
var lookupIpAddress = null;

for (var dev in ifaces) {
    if(dev != "en1" && dev != "en0") {
        continue;
    }

    ifaces[dev].forEach(function(details){
        console.log(details);
        if (details.family=='IPv4') {
            lookupIpAddress = details.address;
            return;
        }
    });
    if(lookupIpAddress) {
        break;
    }
}

module.exports = lookupIpAddress;