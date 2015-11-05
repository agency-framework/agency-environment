var _ = require('lodash');

module.exports = {
    createDefaultRoutes: function(server, options) {

        // optional security gate - auth must be configured inside route plugins
        server.register([require('hapi-auth-jwt2'), require('h2o2')], function (err) {
            if(err){
                console.log(err);
            }

            server.auth.strategy('jwt', 'jwt', true, {
                key: options.services.auth.secret, // Never Share your secret key
                validateFunc: validate       // validate function defined above
            });

            server.register([
                {
                    register: require('./route/debug'),
                    options: options
                }, {
                    register: require('./route/kewego'),
                    options: options.services.kewego
                }, {
                    register: require('./route/auth/session'),
                    options: options.services.auth
                }, {
                    register: require('./route/static'),
                    options: options
                }, {
                    register: require('./route/proxy'),
                    options: {}
                }
            ], function (err) {
                if(err){
                    console.log(err);
                }
            });
        });
    }
}

function validate(decoded, request, callback) {
    if (!decoded.auth_id) {
        return callback(null, false);
    }
    else {
        return callback(null, true);
    }
};