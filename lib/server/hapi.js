var hapi = require('hapi');
var router = require('./middleware/router');

module.exports = function(config) {
    var server = new hapi.Server();
    server.connection({ port: (process.env.PORT || config.port)});
    server.start(function () {
        console.log('Server running at:', server.info.uri);
        router.createDefaultRoutes(server, config);
    });
};

