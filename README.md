## Developing

```shell
./ngrok http 192.168.0.100:8080
# In a different shell
sudo service mysql start
sudo service mongodb start
export IP=192.168.0.100
cp .env.example .env
grunt #npm install -g grunt-cli
export API_URL="https://7dfcfdd0.ngrok.io"
grunt
```

## Running Test Suites
```shell
grunt test
```

## Start Mongodb on c9
```shell
./mongod
```

## Node Virtual Environment Manager
https://github.com/ekalinin/nodeenv`

// http://ns1.cargospace.co/wsdl-atomiadns.wsdl
// http://atomia.github.io/atomiadns/apidocs.html

```shell
curl --header "X-Auth-Username: gorilla@cargospace.co" --header "X-Auth-Password: faker00tX" http://ns1.cargospace.co/atomiadns.json/GetAllZones
[{"name":"retnan.com","id":"1"}]
```

```shell
curl --header "X-Auth-Username: gorilla@cargospace.co" --header "X-Auth-Password: faker00tX" --data '["retnan.com"]' http://ns1.cargospace.co/atomiadns.json/GetZone
[{"name":"retnan.com.","records":[{"type":"CNAME","rdata":"www.cargospace.ng.","class":"IN","id":"4","ttl":"3600","label":"retnan.com."}]},{"name":"@","records":[{"rdata":"ns1.cargospace.co.","type":"NS","label":"@","ttl":"3600","id":"2","class":"IN"},{"label":"@","class":"IN","id":"1","ttl":"3600","type":"SOA","rdata":"ns1.cargospace.co hostmaster.ns1.cargospace.co %serial 10800 3600 604800 86400"}]}]

curl -X PUT -H "Content-Type: application/json" -d '{"NameServers":["ns1.gorillahead.com", "ns2.gorillahead.net", "ns3.gorillahead.org"]}' https://techpool-dretnan.c9users.io/v1/whois/nameserver/resellerdocs.com

curl -H "Content-Type: application/json" -X POST -d '{"name":"plateauunited.net","copyFrom": "retnan.com"}' http://techpool-dretnan.c9users.io/v1/dns/zone

curl -X "DELETE" http://techpool-dretnan.c9users.io/v1/dns/zone/gorilla.net

curl -X PUT -H "Content-Type: application/json" -d '{"name":"plateauunited.net", "rdata": "ns1.cargospace.co admin.ns1.cargospace.co %serial 10800 3600 604800 86400", "id": "18", "type":"SOA","class":"IN","ttl":"3600","label":"@"}' techpool-dretnan.c9users.io/v1/dns/zone/plateauunited.net/18

curl -X POST -H "Content-Type: application/json" -d '{"name":"plateauunited.net", "rdata": "192.168.50.1", "type":"A","class":"IN","ttl":"3600","label":"plateauunited.net"}' techpool-dretnan.c9users.io/v1/dns/zone/plateauunited.net