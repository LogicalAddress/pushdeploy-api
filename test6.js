var laeh = require('laeh2').leanStacks(true), _x = laeh._x
, sshclient = require("sshclient"), //https://www.npmjs.com/package/sshclient
 opts = {
    debug: true,
    console: console,
    host: '52.13.106.117',
  username: 'ubuntu',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEAiKf+++MwoQnohoA5H4Xiw7GGkU6oxu7OU/7eDNuYVpnpM0LdYW3vssOW4R7l\nGPJgJXJ0NfCub+tpsfYmXAhqcLeQuMMjYCqFAvo2nF6wCbk3l020n8TJcnuRuCKXYq2VJBQOuMSm\nuQJYyddFX4QVlk6XMjhVMq59ROhzay92QDYJ1Pi+b/lVIU22IRqPC8kf8WxM2wPgTSdpNp4hIKcx\nYlPpzPovjgiB3mmAn7FDwSsDAktrCuGnu7x5/HGywdAo0tiZI1hmbuEWBdzrY+tPdSiMLI0fFgrw\ncIW4pN7eySKciQcGwnCdDkFodHjKqJBrXGqzEajI2qo/P9Ai5cWqbwIDAQABAoIBAHEm8Wmt12Ew\nbBmaaDIi0P4Kq4r7n6KAr9U67q+k0IG8lSx9zALVXakebHrg8v9yCYxYNcNIE5fWTEEvuNlxmnjU\ndf+WjF8fNd2eQsO9X3PdqhsdG1dDQS4LBUB7W/A4HIqwFPSG2CnOuKgAGJAbNSis0GKj5F+/vTfm\nZVM2DGrjWlCIpUxwBSRF4jdiU1eSnQVlZtvQHHDbiaq9hYXeFQjvD1Yciw/iIeLB7Qmg0T0MoF5i\nMUyogQqZIeco3/Ml894cvZVcXDzPFQpTpxVzFzbY/FEsjwt4X5obLI71VCHWVavv6mS503sJ+okK\nDblgOJlWzPxADNR9EJd8vEfR84kCgYEA2liGZyZuKi2GSfc2q1u4XAYD5CB2DKCsspNyONBrvgwR\nBdwV9TQdmaUhhB9dHHo+trVa7vL+SFGBAP9AkFZPkIel3ljb/31z07GBhivFei/ZoQKnmNfuuoO5\nRSkd9Oqx5OP2j5fsuTeJjj2SqoFdQZsKHcTESL4YSk2YIvizLGUCgYEAoDkPj2Xcn6jJvvhgZIG5\njZscy1u9cyDgZNVERv0nEi2ZlZJSwp8cDSTlurY99TIcE2k80RwVQgdTxUL689HI65F9+gU0v6DU\nedgcfmuSysiowAtMg1dWgDcgFNaoRyKG7hp1caXvjJP/9nfPaCQ6YF0R66t03O6uweAq7t6OHEMC\ngYBTuWJAJ2JS1gYKUrsp1g/JaZ0QWsopaWsPRq6jzneh9iqI3q2kyokXI1TIvuYLR2zIzp3Bxndu\n76HR6g6tygrUVs9phRVG0KobYJNUCXC9u59tuADgANzPtDbUqEGOangwVqFyykTBeORMIJweuWAz\nCepFI/BIHGxgAYT20/qQaQKBgQCdIBhAWnaIJLDklROCvS1Iz4rnaypZEy678+GndG+yhgGOCxca\nQYry4PJhroMISIH8D0JTF6VJQYJHey47mcneKqpOXHikTIbSjrsyxzAHqczDuNDqJOZxip3tka0p\nRZTpQA1YzJAlXqawAELoME8HXX5LjbNnTrMW8k1oP91BnQKBgHm86pRQPAAHBAAQ71QghuKeEpsq\nydDumPRL/UmsftHw7OSxBQzwGeQYbAKZMWYbf+kuW3GwSior/SRP0/i3s1hwylP409Vq0pSfLexn\nCAqWmJp8kBgh4lF5MFiD+KcTVj51bWxYQB4sV/b99IgCEXg7dyP1/liNP1dhHIs7EAgZ\n-----END RSA PRIVATE KEY-----',
    session: [
         { op: 'exec', command: 'ls /' },
    ]
};

var cb = function(err, response){
    console.log(err, response);
    console.log("eventual cb called");
    if(count == 4){
        opts.host = '52.13.106.116';
    }else if(count == 5){
        return;
    }
    fn();
    count++;
};
var fn = function(){
    sshclient.session(opts, _x(cb, true, function(err, data) {
        console.log(err, data);
        // clearInterval(id);
        console.log('Test...DONE');
    }));
}

// var id = setInterval(fn, 5000);
fn();
var count = 1;