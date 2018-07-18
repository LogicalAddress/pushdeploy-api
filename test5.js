var fs = require("fs");
var Client = require('ssh2').Client,
opts = {
    port: 22,
    debug: true,
    console: console,
};
opts.host = '34.211.218.73';
opts.username = 'ubuntu';
opts.privateKey = fs.readFileSync(__dirname + '/launcher.pem');


var conn = new Client();
conn.on('ready', function() {
    conn.shell(function(err, stream) {
        if (err) throw err;
        stream.on('close', function() {
            console.log('Stream :: close');
            conn.end();
        }).on('data', function(data) {
            console.log(data.toString());
        }).stderr.on('data', function(data) {
            //console.log('STDERR: ' + data);
        });
        stream.end('tail -n 100 /home/ubuntu/log.out;\nexit\n');
  });
  
}).connect(opts);