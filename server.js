var express = require('express');
var config = require('./config/app');
var models = require('./config/models');

var app = express();
require('./config/express')(app, config);
app.listen(process.env.PORT || config.port);