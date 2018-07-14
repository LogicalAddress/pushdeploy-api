var ALLOW_ORIGIN = '*';
/**
 * Add necessary headers to enable request from domain
 * @method allowCrossDomain
 * @param reg {Request} the request object
 * @param res {Response} the response object
 * 
 * */
module.exports.allowCrossDomain = function(req, res, next) {
    if (req.method.toLowerCase() === 'options') {
      var headers = {};
      // IE8 does not allow domains to be specified, just the *
      // headers["Access-Control-Allow-Origin"] = req.headers.origin;
      headers["Access-Control-Allow-Origin"] = ALLOW_ORIGIN;
      headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS, PATCH";
      headers["Access-Control-Allow-Credentials"] = false;
      headers["Access-Control-Max-Age"] = '86400'; // 24 hours
      headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, X-Access-Token, X-Auth-Token";
      res.writeHead(200, headers);
      res.end();
    } else {
        next();
    }
};
