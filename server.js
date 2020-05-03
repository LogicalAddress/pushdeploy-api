var config = require('./config/app');
var express = require('express');
const redis = require('socket.io-redis');
var mongoose = require('mongoose');
// mongoose.Promise = require('bluebird');

mongoose.connect(config.mongoStorage.url, {
  useMongoClient: true,
//   /* other options */
});
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('MongoDB: Unable to connect to database at ' + config.mongoStorage.url);
});

var app = express();

// app.listen(process.env.PORT || config.port, config.IP);
// require('./config/express')(app, config);


var io = require('socket.io').listen(app.listen(config.port));
let caCert = fs.readFileSync("./redis-pushdeploy.cert");
io.adapter(redis(config.redis.url, {tls: { ca: caCert}}));
require('./config/express')(app, config, io);


io.on("connection", (socket) => {
  console.log(socket.user.name + " connected");
  socket.emit("connected", "Live updates from pushdeploy is available");
  socket.join(socket.user.uid);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});