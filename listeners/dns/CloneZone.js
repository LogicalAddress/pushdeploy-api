var NameServer = require("../../lib/dns/lib");
var _ = require("underscore");

module.exports = function(app, socketIO){
    process.on('cloneZone', function(to, from){
        NameServer.GetZoneBinary(from).then((result) => {
            if(_.has(result.status != "succcess") || 
            _.isObject(result.data) && _.has(result.data, 'error')){
                console.log(result);
                return;
            }
            NameServer.RestoreZoneBinary({
                name: to,
                zone: result.data,
            }).then((result)=>{
                console.log(result);
            }).catch((err)=>{
                console.log(err);
            });
        
        }).catch((err)=>{
            console.log(err);
        });
    });
};