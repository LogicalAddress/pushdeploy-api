/**
 * @module CreateZone
 */

var _ = require('underscore');
 
module.exports = function (req, res, next)
{
    if( !_.has(req.body, 'name') || !_.has(req.body, 'id') || !_.has(req.body, 'label') ||
        !_.has(req.body, 'class') || !_.has(req.body, 'ttl') || !_.has(req.body, 'type') || 
        !_.has(req.body, 'rdata')){
        return res.status(500).json({message: "All fields are required"});
    }else{
        // TODO perform thorough validation here based on DNS Type before next()
        _.extend(req.body, {entries: [{
            id: parseInt(req.body.id), 
            label: req.body.label, 
            'class': req.body.class, 
            ttl: parseInt(req.body.ttl), 
            type: req.body.type, 
            rdata: req.body.rdata}]});
        next();
    }
};