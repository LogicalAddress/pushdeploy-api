var config = require('./config/app');
if(!config.mongoStorage.url){
  console.log('Please `cp .env.example .env` first');
  process.exit();
}
var express = require('express');
var mongoose = require('mongoose');

mongoose.connect(config.mongoStorage.url);
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('MongoDB: Unable to connect to database at ' + config.mongoStorage.url);
});

var app = express();
require('./config/express')(app, config);
app.listen(process.env.PORT || config.port);