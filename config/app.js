if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'staging') {
  require('dotenv').config({path:__dirname+'/../.env'});
}

var env = process.env.NODE_ENV || 'development';
var path = require('path');
var AppRoot = path.normalize(__dirname + '/..');
var MONGODB_URL = process.env.MONGODB_URL || 
(process.env.MONGODB_USER ? 
    `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT || '27017'}/${process.env.MONGODB_DB || 'pushdeploy'}` 
      : `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT || '27017'}/${process.env.MONGODB_DB || 'pushdeploy'}`);

var REDIS_URL = process.env.REDIS_URL || 
      (process.env.REDIS_PASS ? 
          `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || '6379'}/${process.env.REDIS_DB || 'pushdeploy'}?password=${process.env.REDIS_PASS}` 
            : ( process.env.REDIS_DB ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || '6379'}/${process.env.REDIS_DB || 'pushdeploy'}?password=${process.env.REDIS_PASS}` 
            : ( process.env.REDIS_PASS ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || '6379'}/?password=${process.env.REDIS_PASS}` 
            : `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || '6379'}`)));

var config = {
  development: {
    AppName: 'pushdeploy-api',
    AppDomain: process.env.API_URL,
    emailManagement: process.env.EMAIL_MANAGEMENT_URL || 'http://localhost:5000',
    dashboardURL:  process.env.DASHBOARD_URL || 'http://localhost:3000',
    GitWebHookUrl: process.env.GIT_WEB_HOOK_URL,
    AppRoot: AppRoot,
    PoolSize: 1000000000,
    port: process.env.PORT || 8080,
    IP: process.env.IP || '0.0.0.0',
    mongoStorage: {
      url: MONGODB_URL,
    },
    redis: {
      url: REDIS_URL,
    },
    ClientSetting: {
      stripeKey: process.env.STRIPE_PUBLIC_KEY || 'pk_test_XBKJelDADCVD0ApW1Cx9pK0v',
      paystackKey: process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_8eb0c568b925399e7192843b4c8a20bbb80a9295',
      stripePlanA: process.env.STRIPE_PLAN_A || 'pushdeploy-test',
      stripePlanADesc: 'Deploy Test $9.99/Month',
      stripePlanAA: process.env.STRIPE_PLAN_AA || 'price_1GrSppBCbNSslgzUn0RRPejH',
      stripePlanAADesc: 'Deploy Test $99.90/Year',
      stripePlanB: process.env.STRIPE_PLAN_B || 'plan_HDd9VVjQJAYNmu',
      stripePlanBDesc: 'Deploy Pro $19.99/Month',
      stripePlanBB: process.env.STRIPE_PLAN_BB || 'price_1GrSouBCbNSslgzUI1L8tXbQ',
      stripePlanBBDesc: 'Deploy Pro $199.90/Year',
      stripePlanAAmount: '999',
      stripePlanAAAmount: '9990',
      stripePlanBAmount: '1999',
      stripePlanBBAmount: '19990',
      githubPublicKey: process.env.GITHUB_PUBLIC_KEY,
      bitbucketPublicKey: process.env.BITBUCKET_PUBLIC_KEY,
      linodePublicKey: process.env.LINODE_PUBLIC_KEY || "30b8582270f3e13b1510",
    },
    payment: {
      stripeKey: process.env.STRIPE_PUBLIC_KEY || 'pk_test_XBKJelDADCVD0ApW1Cx9pK0v',
      paystackKey: process.env.PAYSTACK_PUBLIC_KEY,
      stripeSecretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_J35O2h0MYmbkwau6JvOZTH3Y',
      paystackSecretKey: process.env.PAYSTACK_SECRET_KEY
    },
    OAuth: {
      bitbucket:{
        publicKey: process.env.BITBUCKET_PUBLIC_KEY,
        secretKey: process.env.BITBUCKET_SECRET_KEY
      },
      github:{
        publicKey: process.env.GITHUB_PUBLIC_KEY,
        secretKey: process.env.GITHUB_SECRET_KEY
      },
      linode: {
        publicKey: process.env.LINODE_PUBLIC_KEY || "30b8582270f3e13b1510",
        secretKey: process.env.LINODE_SECRET_KEY || "e1b4094b436523b7d578dd84d1bfc572bc1a336d73305acf9b6aab0c6afac8e2",
      }
    }
  },
  test: {
    AppName: 'pushdeploy-api',
    AppDomain: process.env.API_URL,
    emailManagement: process.env.EMAIL_MANAGEMENT_URL,
    dashboardURL:  process.env.DASHBOARD_URL,
    GitWebHookUrl: process.env.GIT_WEB_HOOK_URL,
    AppRoot: AppRoot,
    PoolSize: 1000000000,
    port: process.env.PORT,
    IP: process.env.IP,
    mongoStorage: {
      url: MONGODB_URL,
    },
    redis: {
      url: REDIS_URL,
    },
    ClientSetting: {
      stripeKey: process.env.STRIPE_PUBLIC_KEY,
      paystackKey: process.env.PAYSTACK_PUBLIC_KEY,
      stripePlanA: process.env.STRIPE_PLAN_A || 'pushdeploy-test',
      stripePlanADesc: 'Deploy Test $9.99/Month',
      stripePlanAA: process.env.STRIPE_PLAN_AA || 'pushdeploy-test',
      stripePlanAADesc: 'Deploy Test $99.90/Year',
      stripePlanB: process.env.STRIPE_PLAN_B || 'plan_HDd9VVjQJAYNmu',
      stripePlanBDesc: 'Deploy Pro $19.99/Month',
      stripePlanBB: process.env.STRIPE_PLAN_BB || 'plan_HDd9VVjQJAYNmu',
      stripePlanBBDesc: 'Deploy Pro $199.90/Year',
      stripePlanAAmount: '999',
      stripePlanAAAmount: '9990',
      stripePlanBAmount: '1999',
      stripePlanBBAmount: '19990',
      githubPublicKey: process.env.GITHUB_PUBLIC_KEY,
      bitbucketPublicKey: process.env.BITBUCKET_PUBLIC_KEY,
      linodePublicKey: process.env.LINODE_PUBLIC_KEY
    },
    payment: {
      stripeKey: process.env.STRIPE_PUBLIC_KEY,
      paystackKey: process.env.PAYSTACK_PUBLIC_KEY,
      stripeSecretKey: process.env.STRIPE_SECRET_KEY,
      paystackSecretKey: process.env.PAYSTACK_SECRET_KEY
    },
    OAuth: {
      bitbucket:{
        publicKey: process.env.BITBUCKET_PUBLIC_KEY,
        secretKey: process.env.BITBUCKET_SECRET_KEY
      },
      github:{
        publicKey: process.env.GITHUB_PUBLIC_KEY,
        secretKey: process.env.GITHUB_SECRET_KEY
      },
      linode: {
        publicKey: process.env.LINODE_PUBLIC_KEY,
        secretKey: process.env.LINODE_SECRET_KEY
      }
    }
  },
  staging: {
    AppName: 'pushdeploy-api',
    AppDomain: process.env.API_URL,
    emailManagement: process.env.EMAIL_MANAGEMENT_URL,
    dashboardURL:  process.env.DASHBOARD_URL,
    GitWebHookUrl: process.env.GIT_WEB_HOOK_URL,
    AppRoot: AppRoot,
    PoolSize: 1000000000,
    port: process.env.PORT,
    IP: process.env.IP,
    mongoStorage: {
      url: MONGODB_URL,
    },
    redis: {
      url: REDIS_URL,
    },
    ClientSetting: {
      stripeKey: process.env.STRIPE_PUBLIC_KEY,
      paystackKey: process.env.PAYSTACK_PUBLIC_KEY,
      stripePlanA: process.env.STRIPE_PLAN_A || 'pushdeploy-test',
      stripePlanADesc: 'Deploy Test $9.99/Month',
      stripePlanAA: process.env.STRIPE_PLAN_AA || 'pushdeploy-test',
      stripePlanAADesc: 'Deploy Test $99.90/Year',
      stripePlanB: process.env.STRIPE_PLAN_B || 'plan_HDd9VVjQJAYNmu',
      stripePlanBDesc: 'Deploy Pro $19.99/Month',
      stripePlanBB: process.env.STRIPE_PLAN_BB || 'plan_HDd9VVjQJAYNmu',
      stripePlanBBDesc: 'Deploy Pro $199.90/Year',
      stripePlanAAmount: '999',
      stripePlanAAAmount: '9990',
      stripePlanBAmount: '1999',
      stripePlanBBAmount: '19990',
      githubPublicKey: process.env.GITHUB_PUBLIC_KEY,
      bitbucketPublicKey: process.env.BITBUCKET_PUBLIC_KEY,
      linodePublicKey: process.env.LINODE_PUBLIC_KEY
    },
    payment: {
      stripeKey: process.env.STRIPE_PUBLIC_KEY,
      paystackKey: process.env.PAYSTACK_PUBLIC_KEY,
      stripeSecretKey: process.env.STRIPE_SECRET_KEY,
      paystackSecretKey: process.env.PAYSTACK_SECRET_KEY
    },
    OAuth: {
      bitbucket:{
        publicKey: process.env.BITBUCKET_PUBLIC_KEY,
        secretKey: process.env.BITBUCKET_SECRET_KEY
      },
      github:{
        publicKey: process.env.GITHUB_PUBLIC_KEY,
        secretKey: process.env.GITHUB_SECRET_KEY
      },
      linode: {
        publicKey: process.env.LINODE_PUBLIC_KEY,
        secretKey: process.env.LINODE_SECRET_KEY
      }
    }
  },
  production: {
    AppName: 'pushdeploy-api',
    AppDomain: process.env.API_URL,
    emailManagement: process.env.EMAIL_MANAGEMENT_URL,
    dashboardURL:  process.env.DASHBOARD_URL,
    GitWebHookUrl: process.env.GIT_WEB_HOOK_URL,
    AppRoot: AppRoot,
    PoolSize: 1000000000,
    port: process.env.PORT,
    IP: process.env.IP,
    mongoStorage: {
      url: MONGODB_URL,
    },
    redis: {
      url: REDIS_URL,
    },
    ClientSetting: {
      stripeKey: process.env.STRIPE_PUBLIC_KEY,
      paystackKey: process.env.PAYSTACK_PUBLIC_KEY,
      stripePlanA: process.env.STRIPE_PLAN_A || 'pushdeploy-test',
      stripePlanADesc: 'Deploy Test $9.99/Month',
      stripePlanAA: process.env.STRIPE_PLAN_AA || 'pushdeploy-test',
      stripePlanAADesc: 'Deploy Test $99.90/Year',
      stripePlanB: process.env.STRIPE_PLAN_B || 'plan_HDd9VVjQJAYNmu',
      stripePlanBDesc: 'Deploy Pro $19.99/Month',
      stripePlanBB: process.env.STRIPE_PLAN_BB || 'plan_HDd9VVjQJAYNmu',
      stripePlanBBDesc: 'Deploy Pro $199.90/Year',
      stripePlanAAmount: '999',
      stripePlanAAAmount: '9990',
      stripePlanBAmount: '1999',
      stripePlanBBAmount: '19990',
      githubPublicKey: process.env.GITHUB_PUBLIC_KEY,
      bitbucketPublicKey: process.env.BITBUCKET_PUBLIC_KEY,
      linodePublicKey: process.env.LINODE_PUBLIC_KEY
    },
    payment: {
      stripeKey: process.env.STRIPE_PUBLIC_KEY,
      paystackKey: process.env.PAYSTACK_PUBLIC_KEY,
      stripeSecretKey: process.env.STRIPE_SECRET_KEY,
      paystackSecretKey: process.env.PAYSTACK_SECRET_KEY
    },
    OAuth: {
      bitbucket:{
        publicKey: process.env.BITBUCKET_PUBLIC_KEY,
        secretKey: process.env.BITBUCKET_SECRET_KEY
      },
      github:{
        publicKey: process.env.GITHUB_PUBLIC_KEY,
        secretKey: process.env.GITHUB_SECRET_KEY
      },
      linode: {
        publicKey: process.env.LINODE_PUBLIC_KEY,
        secretKey: process.env.LINODE_SECRET_KEY
      }
    }
  }
};


module.exports = config[env];