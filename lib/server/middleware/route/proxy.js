var mime = require('mime-types');
var wreck = require('wreck');

exports.register = function (server, options, next) {
    server.route({
        method: 'GET',
        path: '/proxy',
        config: {
            auth: false //false or 'jwt'
        },
        handler: {
            proxy: {
                redirects: 5,
                mapUri: function(request, callback){
                    callback(null, request.query.url);
                }
            }
        }
    });

    next();
};

exports.register.attributes = {
    name: 'proxy',
    version: '1.0.0'
};