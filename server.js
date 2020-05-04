var config = require('./config/app');
var express = require('express');
const redis = require('socket.io-redis');
var mongoose = require('mongoose');
const fs = require('fs'); 

mongoose.connect(config.mongoStorage.url, {
  useMongoClient: true,
//   /* other options */
});
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('MongoDB: Unable to connect to database at ' + config.mongoStorage.url);
});

var app = express(), io;

if(process.env.NODE_ENV == 'development' || 
  process.env.NODE_ENV == 'test' ){
  io = require('socket.io').listen(app.listen(config.port, config.IP));
  io.adapter(redis(config.redis.url));
}else{
  let caCert = fs.readFileSync("./redis-pushdeploy.cert");
  let caKey = fs.readFileSync('redis-pushdeploy.key');
  io = require('socket.io').listen(app.listen(config.port));
  io.adapter(redis(config.redis.url, {tls: { cert: caCert, key: caKey}}));
}

require('./config/express')(app, config, io);


io.on("connection", (socket) => {
  console.log(socket.user.name + " connected");
  socket.emit("connected", "Live updates from pushdeploy is available");
  socket.join(socket.user.uid);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});