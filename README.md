// http://ns1.cargospace.co/wsdl-atomiadns.wsdl
// http://atomia.github.io/atomiadns/apidocs.html

curl --header "X-Auth-Username: gorilla@cargospace.co" --header "X-Auth-Password: faker00tX" http://ns1.cargospace.co/atomiadns.json/GetAllZones
[{"name":"retnan.com","id":"1"}]

curl --header "X-Auth-Username: gorilla@cargospace.co" --header "X-Auth-Password: faker00tX" --data '["retnan.com"]' http://ns1.cargospace.co/atomiadns.json/GetZone
[{"name":"retnan.com.","records":[{"type":"CNAME","rdata":"www.cargospace.ng.","class":"IN","id":"4","ttl":"3600","label":"retnan.com."}]},{"name":"@","records":[{"rdata":"ns1.cargospace.co.","type":"NS","label":"@","ttl":"3600","id":"2","class":"IN"},{"label":"@","class":"IN","id":"1","ttl":"3600","type":"SOA","rdata":"ns1.cargospace.co hostmaster.ns1.cargospace.co %serial 10800 3600 604800 86400"}]}]

curl -X PUT -H "Content-Type: application/json" -d '{"NameServers":["ns1.gorillahead.com", "ns2.gorillahead.net", "ns3.gorillahead.org"]}' https://techpool-dretnan.c9users.io/v1/whois/nameserver/resellerdocs.com


HOW TO CREATE A ZONES
======================
<!DOCTYPE html>
<html lang="en">

<head>
    <link rel="stylesheet" href="/css/" type="text/css" media="screen">
    <title>Atomia DNS</title>
</head>

<body>
    <div class="wrapper">
        <div class="header">
            <div class="logo"></div>
            <p class="userInfo">Logged in as: <span class="userName">dretnan@logicaladdress.com</span>\ | <a href="/logout">log out </a></p>
            <div class="clear"></div>
        </div>
        <div class="content">
            <h2>Adding zone</h2>
            <p><a href="/" class="button small pink">&laquo;  Back to index</a></p>
            <form method="post">
                <div class="listRow">
                    <label>Zone to add:
                        <input name="name" value="">
                    </label>
                    <label>Copy records from zone (can be empty):
                        <input name="copyFrom" value="">
                    </label>
                </div>
                <div class="formFooter">
                    <input type="submit" value="Add">
                </div>
            </form>
        </div>
        <div class="footer">
            <p>Powered by <a href="http://atomiadns.com">Atomia DNS</a></p>
        </div>
    </div>
</body>

</html>
    exports.executeOperation = function (req, sres, user, operation, args, callback) {
    if (operation == null || user == null || user.email == null || user.token == null) {
        return callback("invalid input to executeOperation");
    }
    
    var operationReq = exports.getOperationRequest(operation, user.email, user.token);
        operationReq.body = JSON.stringify(args);

        request.post(operationReq, function (error, res, body) {
                if (error) return callback(error);
                if (res.statusCode == 200) {
                        try {
                                var operationResponse = JSON.parse(body);
                                return callback(null, operationResponse)
                        } catch (e) {
                                return callback("invalid JSON returned for " + operation);
                        }
                } else if (res.statusCode >= 401 && res.statusCode <= 403) {
                        req.logout();
                        sres.redirect(req.url);
                        return;
                } else if (body == null || !body.length) {
                        return callback("invalid status for " + operation);
                } else {
                        return callback(exports.humanizeError(body));
                }
        });
    };
                        
                        
app.post('/addzone', auth.ensureAuthenticated, function (req, res) {
                var name = req.body.name;
                var copyFrom = req.body.copyFrom;

                var soa = rest.defaultSOAValues.slice(0);
                soa.unshift(name);
                soa.push(rest.defaultNameservers); //exports.defaultNameservers = process.env['WEBAPP_NAMESERVERS'].split(",");
                soa.push(rest.nameserverGroupName); //exports.nameserverGroupName = process.env['WEBAPP_NAMESERVER_GROUP'] != null ? process.env['WEBAPP_NAMESERVER_GROUP'] : "default";

                rest.executeOperation(req, res, req.user, "AddZone", soa, function (error, response) {
                        if (error) {
                                res.render('addzone.jade', { user: req.user, name: name, error: error });
                        } else if (copyFrom != null && copyFrom.length > 0) {
                                rest.executeOperation(req, res, req.user, "GetZoneBinary", [ copyFrom ], function (error, response) {
                                        if (error) {
                                                res.render('addzone.jade', { user: req.user, name: name, error: error });
                                        } else {
                                                rest.executeOperation(req, res, req.user, "RestoreZoneBinary",
                                                        [ name, rest.nameserverGroupName, response ], function (error, response) {

                                                        if (error) {
                                                                res.render('addzone.jade', { user: req.user, name: name, error: error });
                                                        } else {
                                                                res.redirect('/');
                                                        }
                                                });
                                        }
                                });
                        } else {
                                res.redirect('/');
                        }
                });
        });

HOW TO EDIT ZONES
======================
<!DOCTYPE html>
<html lang="en">

<head>
    <link rel="stylesheet" href="/css/" type="text/css" media="screen">
    <title>Atomia DNS</title>
</head>

<body>
    <div class="wrapper">
        <div class="header">
            <div class="logo"></div>
            <p class="userInfo">Logged in as: <span class="userName">dretnan@logicaladdress.com</span>\ | <a href="/logout">log out </a></p>
            <div class="clear"></div>
        </div>
        <div class="content">
            <h2>Editing zone for <span class="zoneName">retnan.com</span></h2>
            <p><a href="/" class="button small pink">&laquo  Back to index</a></p>
            <form method="post" action="/editrecords/retnan.com">
                <div class="listRow">
                    <input type="hidden" name="records[id][]" value="4">
                    <input type="hidden" name="records[class][]" value="IN">
                    <label>Name
                        <input name="records[label][]" value="retnan.com." class="recordLabel">
                    </label>
                    <label>Type
                        <input name="records[type][]" value="CNAME" class="recordType">
                    </label>
                    <label>TTL
                        <input name="records[ttl][]" value="3600" class="recordTtl">
                    </label>
                    <label>Data
                        <input name="records[rdata][]" value="www.cargospace.ng." class="recordData">
                    </label><a href="/deleterecord/retnan.com/4" class="button small delete">delete</a></div>
                <div class="listRow">
                    <input type="hidden" name="records[id][]" value="2">
                    <input type="hidden" name="records[class][]" value="IN">
                    <label>Name
                        <input name="records[label][]" value="@" class="recordLabel">
                    </label>
                    <label>Type
                        <input name="records[type][]" value="NS" class="recordType">
                    </label>
                    <label>TTL
                        <input name="records[ttl][]" value="3600" class="recordTtl">
                    </label>
                    <label>Data
                        <input name="records[rdata][]" value="ns1.cargospace.co." class="recordData">
                    </label><a href="/deleterecord/retnan.com/2" class="button small delete">delete</a></div>
                <div class="listRow">
                    <input type="hidden" name="records[id][]" value="1">
                    <input type="hidden" name="records[class][]" value="IN">
                    <label>Name
                        <input name="records[label][]" value="@" class="recordLabel">
                    </label>
                    <label>Type
                        <input name="records[type][]" value="SOA" class="recordType">
                    </label>
                    <label>TTL
                        <input name="records[ttl][]" value="3600" class="recordTtl">
                    </label>
                    <label>Data
                        <input name="records[rdata][]" value="ns1.cargospace.co hostmaster.ns1.cargospace.co %serial 10800 3600 604800 86400" class="recordData">
                    </label><a href="/deleterecord/retnan.com/1" class="button small delete">delete</a></div>
                <div class="listRow">
                    <input type="hidden" name="newrecords[id][]" value="-1">
                    <input type="hidden" name="newrecords[class][]" value="IN">
                    <label>Name
                        <input name="newrecords[label][]" value="" class="recordLabel">
                    </label>
                    <label>Type
                        <input name="newrecords[type][]" value="" class="recordType">
                    </label>
                    <label>TTL
                        <input name="newrecords[ttl][]" value="" class="recordTtl">
                    </label>
                    <label>Data
                        <input name="newrecords[rdata][]" value="" class="recordData">
                    </label>
                </div>
                <div class="formFooter">
                    <input type="submit" value="save">
                </div>
            </form>
        </div>
        <div class="footer">
            <p>Powered by <a href="http://atomiadns.com">Atomia DNS</a></p>
        </div>
    </div>
</body>

</html>



curl -H "Content-Type: application/json" -X POST -d '{"name":"plateauunited.net","copyFrom": "retnan.com"}' http://techpool-dretnan.c9users.io/v1/dns/zone

curl -X "DELETE" http://techpool-dretnan.c9users.io/v1/dns/zone/gorilla.net
