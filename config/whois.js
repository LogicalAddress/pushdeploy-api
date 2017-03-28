var env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    enom: {
        API_KEY: "API_KEY",
        END_POINT: "https://resellertest.enom.com/interface.asp?uid=resellid&pw=resellpw&responsetype=xml",
    },
  },
  test: {
    enom: {
        API_KEY: "API_KEY",
        END_POINT: "https://resellertest.enom.com/interface.asp?uid=resellid&pw=resellpw&responsetype=xml",
    },
  },
  production: {
    enom: {
        API_KEY: process.env.DOMAIN_PROVIDER_KEY,
        END_POINT: process.env.DOMAIN_PROVIDER_HOST
    },
  }
};


module.exports = config[env];