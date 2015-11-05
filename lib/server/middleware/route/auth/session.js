var aguid = require('aguid');
var jwt = require('jsonwebtoken');
var _ = require('lodash');

exports.register = function (server, options, next) {

    server.route({
        method: ['GET','POST'],
        path: "/auth/session",
        config: {
            auth: false
        },
        handler: function(request, reply) {
            var session = _.extend(request.payload, {
                valid: true, // this will be set to false when the person logs out
                auth_id: aguid(), // a random session id
                exp: new Date().getTime() + 30 * 60 * 1000 // expires in 30 minutes time
            });

            sendReply(reply, session, options.secret);
        }
    });

    next();
};

function sendReply(reply, session, secret) {
    if(session) {
        reply().header("Authorization", jwt.sign(session, secret));
    } else {
        reply().code(403);
    }
}

exports.register.attributes = {
    name: 'auth/session',
    version: '1.0.0'
};