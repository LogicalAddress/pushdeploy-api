curl -X PUT -H "Content-Type: application/json" -d '{"NameServers":["ns1.gorillahead.com", "ns2.gorillahead.net", "ns3.gorillahead.org"]}' https://techpool-dretnan.c9users.io/v1/whois/nameserver/resellerdocs.com


{
"interface-response":{
    "RRPCode":"212",
    "RRPText":"Host is available",
    "Command":"MODIFYNS",
    "APIType":"API.NET",
    "Language":"eng",
    "ErrCount":"1",
    "errors":{
        "Err1":"Nameserver 'ns1.gorillahead.com' could not be registered"
    },
    "ResponseCount":"1",
    "responses":{
        "response":{
            "ResponseNumber":"609285",
            "ResponseString":"System error; failed to add; nameserver(s)"
        }
    },
    "MinPeriod":"1",
    "MaxPeriod":"10",
    "Server":"sjl1vwresell_t1",
    "Site":"eNom",
    "IsLockable":"True",
    "IsRealTimeTLD":"True",
    "TimeDifference":"+8.00",
    "ExecTime":"0.672",
    "Done":"true",
    "TrackingKey":"c1b80b39-df9d-4c4f-bd54-481f95ec60c5",
    "RequestDateTime":"3/28/2017 2:09:07 PM","debug":{}}}

curl -X PUT -H "Content-Type: application/json" -d '' https://techpool-dretnan.c9users.io/v1/whois/nameserver/resellerdocs.com
{"interface-response":{
    "RRPCode":"200",
    "RRPText":"Command completed successfully",
    "Command":"MODIFYNS",
    "APIType":"API.NET",
    "Language":"eng",
    "ErrCount":"0",
    "ResponseCount":"0",
    "MinPeriod":"1",
    "MaxPeriod":"10",
    "Server":"sjl1vwresell_t1",
    "Site":"eNom",
    "IsLockable":"True",
    "IsRealTimeTLD":"True",
    "TimeDifference":"+8.00",
    "ExecTime":"0.672",
    "Done":"true",
    "TrackingKey":"707a6787-a4d8-45b8-a1b8-93fa9f0e2b87",
    "RequestDateTime":"3/28/2017 2:10:21 PM","debug":{}}}