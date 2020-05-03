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


var io = require('socket.io').listen(app.listen(config.port, config.IP));
io.adapter(redis(config.redis.url));
require('./config/express')(app, config, io);


io.on("connection", (socket) => {
  console.log(socket.user.name + " connected");
  socket.emit("connected", "Live updates from pushdeploy is available");
  socket.join(socket.user._id);
  // io.to("5eae9a66e3888914a8074a07").emit('CREATE_SERVER_SUCCESS',{
  //   action: 'CREATE_SERVER_SUCCESS',
  //   data: {
  //     _id: "128121821212121",
  //     server_name: "Ubuntu System",
  //     status: "RUNNING",
  //     provider: "SOCKET",
  //     ipv4: "192.168.0.1"
  //   }
  // });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});


// setInterval(() => {
//   console.log("emitting..");
//   io.to("5eae9a66e3888914a8074a07").emit('CREATE_SERVER_SUCCESS', {
//     action: 'CREATE_SERVER_SUCCESS',
//     data: {
//       _id: "128121821212121",
//       server_name: "Ubuntu System",
//       status: "RUNNING",
//       provider: "SOCKET",
//       ipv4: "192.168.0.1"
//     }
//   });
// }, 4000);