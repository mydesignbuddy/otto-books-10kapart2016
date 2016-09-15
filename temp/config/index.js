//Store your API Keys and stuff here.
'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/..');
var env = process.env.NODE_ENV || 'development';

var config = {
    development: {
        dirs: {
            pub     : path.resolve('public/'),
            bower   : path.resolve('bower_components/'),
            views   : path.resolve('views/'),
            layouts : path.resolve('views/layouts/'),
            partials: path.resolve('views/partials/'),
            shared  : path.resolve('shared/templates/')
        },
        root: rootPath,
        app: {
            name: 'OttoBooks'
        },
        port: 3000,
    },
    production: {
        dirs: {
            pub     : path.resolve('public/'),
            bower   : path.resolve('bower_components/'),
            views   : path.resolve('views/'),
            layouts : path.resolve('views/layouts/'),
            partials: path.resolve('views/partials/'),
            shared  : path.resolve('shared/templates/')
        },
        root: rootPath,
        app: {
            name: 'OttoBooks'
        },
        port: 80,
    }
};

module.exports = config[env];