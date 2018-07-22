var laeh = require('laeh2').leanStacks(true), _x = laeh._x

var fn = function(){
    return new Promise(function(resolve, reject) {
        setTimeout(_x((err)=>{
            reject(err);
        }, true, (err, res)=>{
            throw new Error("Hello World") ||
            resolve("successful");
        }), 3000);
    });
};

process.on("prestart", ()=>{
    process.emit("aws_ec2_is_ready", 5);
});

process.on('aws_ec2_is_ready', function(retryAttempts){
    fn().then((res)=>{
        console.log(res);
    }).catch((err)=>{
        console.log(err);
        console.log("retryAttempts", retryAttempts);
        if(retryAttempts) process.emit("aws_ec2_is_ready", retryAttempts - 1);
    });
});

process.emit("prestart");