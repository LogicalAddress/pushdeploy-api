var UserServer = require('../../lib/launcher/UserServers'),
UserApp = require('../../lib/launcher/UserApps'),
notifier = require("../../lib/launcher/notifier"),
setupEc2 = require("../../lib/launcher/v1/setupEc2");


var copts = {
	example_repo: "https://github.com/shapeshed/express_example.git",
	node_version: "8.9.3",
	entry_point: "bin/www"
};

var doit = function(server, retryAttempts, req){
    // UserServer.findById(server._id)
        // .then((server)=>{
        var _app;
        UserApp.create({
        	uid: server.uid,
        	server: server._id,
        	app_name: 'default',
        	app_repository: copts.example_repo,
        	template: 'nodejs',
        	template_variation: copts.node_version,
        	isPublic: true,
        	git_provider: "github"
        }).then((app)=>{
            _app = app;
            console.log("App Created", app, "setting up Server With Default App");
            setupEc2(server).then((status)=>{
                try{
                    req.io.to(server.uid).emit('CREATE_SERVER_SUCCESS', server);
                }catch(err){
                    console.log("socket.io failed", err.message);
                }
    	    	notifier({
    	    	    uid: server.uid,
    		    	data: {
    			    	ACTION: "INIT_AWS_SERVER_WITH_DEFAULT_APP",
    			    	O_REQ: null,
    			    	MESSAGE: 'RUNNING',
    			    	DATA: Object.assign(server, app)
    		    	}
    	    	});
    	    	notifier({
            		uid: server.uid,
            		data:{
    			    	ACTION: "CREATE_APP",
    			    	O_REQ: null,
    			    	MESSAGE: "success",
    			    	DATA: app
            		}
        	    });
            }).catch((error)=>{
                console.log("Setting Up Server Failed", error);
                UserApp.delete(_app).then((response)=>{
                    console.log("removing app..", _app);
                }).catch((error)=>{
                    console.log("unable to remove app");
                });
                console.log("check retryAttempts");
                if(!retryAttempts){
                    console.log("You should undo everything");
                    try{
                        req.io.to(server.uid).emit('CREATE_SERVER_FAILED', server);
                    }catch(err){
                        console.log("socket.io failed", err.message);
                    };
                    return;
                }
                console.log("Retry Attempts Left", retryAttempts - 1);
                setTimeout(()=>{
                    doit(server, retryAttempts - 1);
                }, 5000);
                
            });
        }).catch((error)=>{
            console.log("Creating Default App Failed (Undo App Create Now", error);
        });
    // }).catch((error)=>{
        // console.log("For some reasons, the server we had just created is lost");
    // });
};

module.exports = function(app){
    process.on('aws_ec2_is_ready', function(server, retryAttempts, req){
        console.log("doit(server, retryAttempts);");
        doit(server, retryAttempts, req);
    });	
};