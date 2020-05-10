/**
 * @module CreateZone
 */

var _ = require('underscore');
 
module.exports = function (req, res, next)
{
   //check if linode_token is expired and use referesh token to 
   // re-authorize also if user has required scope for pushd
   var credential = req.techpool.credentials; //TODO:
   /*
   with credential
    .linode_token
    .linode_username
    .linode_scope
    .linode_refresh_token
    .linode_token_expiry
    .linode_token_type
    .linode_raw
   */
   next();
};