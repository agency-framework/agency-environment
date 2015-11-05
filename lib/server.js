module.exports = function(config) {
    if(config) {
        init(JSON.parse(config));
    } else {
        return init;
    }
}(process.env.CONFIG);

function init(config) {

    if(config.hapi) {
        require('./server/hapi')(config.hapi);

        if(config.webpack) {
            require('./server/hapi-webpack')(config.dest, config.host, config.hapi, config.webpack);
        }
    }


//    if(config.weinre) {
//        require('./server/weinre')(config.weinre);
//    }
}