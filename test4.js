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
    conn.sftp(function(err, sftp) {
        console.log("initiatiating sftp");
        if (err) {
            console.log(err.message);
            return;
        }
        var remoteFile = "/home/ubuntu/log.out";
        var localFile = "remote_logs";
        sftp.fastGet(remoteFile, localFile , {}, function(downloadError){
            if(downloadError) throw downloadError;
            console.log("Succesfully downloaded");
            conn.end();
            return;
        });
    });
}).connect(opts);