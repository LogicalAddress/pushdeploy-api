/**
 * @module CreateZone
 */

var _ = require('underscore');
 
module.exports = function (req, res, next)
{
    if(!_.has(req.body, 'name') || !_.has(req.body, 'zone')){
        return res.status(500).json({message: "name and zone is required and must be a valid domain name and text respectively"});
    }else{
        // Todo Check that it's a valid domain before calling next
        next();
    }
};