/**
 * @module CreateZone
 */

var _ = require('underscore');
 
module.exports = function (req, res, next)
{
    if(!_.has(req.body, 'name')){
        return res.status(500).json({message: "name is required and must be a valid domain name"});
    }else{
        // Todo Check that it's a valid domain before calling next
        _.extend(req.body, {copyFrom: req.body.copyFrom || ""});   
        next();
    }
};