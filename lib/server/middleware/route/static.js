var Inert = require('inert');

exports.register = function (server, options, next) {
    server.register(Inert, function () {});
    server.route({
        method: "GET",
        path: "/{param*}",
        config: {
            auth: false //false or 'jwt'
        },
        handler: {
            directory: {
                path: options.root
//                    listing: true
            }
        }
    });

    next();
};

exports.register.attributes = {
    name: 'static',
    version: '1.0.0'
};