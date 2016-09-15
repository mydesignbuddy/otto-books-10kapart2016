
var compression = require('compression');
var express = require('express'),
  config = require('./config/config');

var app = express();
app.use(compression());

require('./config/express')(app, config);


app.listen(config.port, function () {
  console.log('Express server listening on port ' + config.port);
});

