var hapi = require('hapi');
var webpackConnection = require('hapi-webpack-connection');
var webpack = require('webpack');

var hotReplacementPlugin = require('../webpack/plugins/hotReplacement.js')(webpack);
var dedupePlugin = require('../webpack/plugins/dedupe.js')(webpack);



module.exports = function(dest, serverName, hapiConfig, webpackConfig) {
    dest = dest || 'tmp';
    serverName = serverName || 'localhost';

    var options = {
        entry: ['./src/js/main'],
        output: {
            path: dest,
            filename: "js/app.js",
            publicPath: dest
        },

        plugins: [
            hotReplacementPlugin,
            dedupePlugin
        ],

        module: {
            preLoaders: [
                {
                    test: /\.js$/, // include .js files
                    exclude: /node_modules/, // exclude any and all files in the node_modules folder
                    loader: "jshint-loader"
                }
            ],
            loaders: [
                { test: /\.hbs$/, loader: "handlebars-loader" },
                { test: /\.css$/, loader: "style-loader!css-loader" },
                { test: /\.(png|jpg|gif|svg|ttf|woff|eot)$/, loader: "url-loader?limit=100000" }
            ]
//            postLoaders: [
//                {
//                    test: /\.js$/,
//                    exclude: /\/(node_modules|bower_components)\//,
//                    loader: 'autopolyfiller',
//                    query: { browsers: [ '> 5%', 'last 2 versions', 'ie 9', 'Firefox ESR' ] }
//                }
//            ]
        },

        node: {
            __filename: true,
            __dirname: true
        },

        devServer: {
            contentBase: 'http://' + serverName + ':' + hapiConfig.port + '/',
//            contentBae: process.cwd(),
            filename: null, // Get from output.filename
            historyApiFallback: false,
            host: serverName,
            port: webpackConfig.port, // 0 = Randomly selected
            hot: true,
            https: false,
            inline: true,
            lazy: false,
            noInfo: false,
            outputPath: 'http://' + serverName + ':' + webpackConfig.port + '/' + dest + '/',
            publicPath: null, // Get from output.publicPath
            proxy: {},
            quiet: false,
            stats: {
                cached: false,
                cachedAssets: false
                // colors: true or false, turned on if the terminal supports it
            }
        },

        devtool: "#eval-source-map",
        debug: true
    };

    var server = new hapi.Server();
    server.connection(webpackConnection(options).connection);
    server.start(function () {
        console.log('Debug Server running at:', server.info.uri);
    });
}
