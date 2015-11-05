var req = require('request');
var xpath = require('xpath'), dom = require('xmldom').DOMParser;

exports.register = function (server, options, next) {
    server.route({
        method: 'GET',
        path: '/kewego',
        config: {
            auth: false,
            handler: function (request, reply) {
                req('http://api.kewego.com/app/getToken/?appKey=' + options.appKey, function(error, response, xml) {
                    var doc = new dom().parseFromString(xml);
                    reply({token: xpath.select('/kewego_response/message/appToken/text()', doc).toString()});
                });
            }
        }
    });
    next();
};

exports.register.attributes = {
    name: 'kewego',
    version: '1.0.0'
};