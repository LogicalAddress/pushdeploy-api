var express = require('express');
var config = require('./config/app');
var models = require('./config/models');
var mongoose = require('mongoose');

mongoose.connect(config.mongoStorage.url);
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('MongoDB: Unable to connect to database at ' + config.mongoStorage.url);
});

var app = express();
require('./config/express')(app, config);
app.listen(process.env.PORT || config.port);