var fs = require("fs") , laeh = require('laeh2').leanStacks(true), _x = laeh._x
, sshclient = require("sshclient"), //https://www.npmjs.com/package/sshclient
request = require("request"),
 opts = {
    debug: false,
    console: console,
    session: [
        { op: 'writeFile', path: '/home/ubuntu/setup.sh', body: fs.readFileSync(__dirname + '/cargoshell/cargoshell_ubuntu_16.04.sh') },
        { op: 'exec', command: 'chmod +x /home/ubuntu/setup.sh' },
        // { op: 'exec', command: 'export ACTION=init && /home/ubuntu/setup.sh > log.out 2>&1' },
        //PORT = 8080 + APPCOUNTER + 1
        //Setup Server with deafult App
        // { op: 'exec', command: 'export ACTION=init_with_default_app SERVER_ENTRY_POINT=app.js APP_NAME=default PORT=8080 NODE_VERSION=8.9.3 REPOSITORY="https://github.com/dretnan/pie-fake-moneywave.git" && /home/ubuntu/setup.sh > log.out 2>&1' },
        // Add App to Existing server
        //  { op: 'exec', command: 'export ACTION=add_app SERVER_ENTRY_POINT=bin/www APP_NAME=niger.cargospace.ng PORT=8081 NODE_VERSION=8.9.3 REPOSITORY="https://github.com/shapeshed/express_example.git" && /home/ubuntu/setup.sh > log.out 2>&1' },
         //deploy
        //  { op: 'exec', command: 'export ACTION=deploy APP_NAME=niger.cargospace.ng && /home/ubuntu/setup.sh > log.out 2>&1' },
         //status
         { op: 'exec', command: 'export ACTION=status APP_NAME=app.cargospace.ng && /home/ubuntu/setup.sh' },
         //failed
        //  { op: 'exec', command: 'export ACTION=app_failed APP_NAME=app.cargospace.ng && /home/ubuntu/setup.sh > log.out 2>&1' },
    ]
};

var cb = function(err, response){
    if(err) return console.log(err);
	if(!response.webhook) return;
	request.post({
    	url: response.webhook,
    	headers: {
    		'Accept': 'application/json', 
    	},
    	json: response.data,
    },
    (error, response, body) => {
    	console.log("Webhook Response", body);
    });
}
// var ursa = require('ursa');
var ursa = {
    createPrivateKey: function(t){
        return t;
    }
}
opts.host = '54.186.177.198';
opts.username = 'ubuntu';
opts.privateKey = ursa.createPrivateKey(fs.readFileSync(__dirname + '/launcher.pem'));
// opts.privateKey = ursa.createPrivateKey(fs.readFileSync(__dirname + '/pkey'));
sshclient.session(opts, _x(cb, true, function(err, data) {
    console.log('CREATE_INSTANCE...DONE');
    cb(null, {
        webhook: 'https://launcher-dretnan.c9users.io/hooks/custom_created',
        data: {
        	ACTION: "CREATE_INSTANCE",
        	LOG: "",
        	O_REQ: {original: "dump"},
        	REPSONSE: err ? err: "ready"
        }
    });
}));