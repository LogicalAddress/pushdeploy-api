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
      stripePlanA: process.env.STRIPE_PLAN_A || 'Pushdeploy-test',
      stripePlanADesc: 'Deploy test $1/Month',
      stripePlanB: process.env.STRIPE_PLAN_B || 'plan_HDd9VVjQJAYNmu',
      stripePlanBDesc: 'Deploy Pro $4.99/Month',
      stripePlanAAmount: '100',
      stripePlanBAmount: '499',
      githubPublicKey: process.env.GITHUB_PUBLIC_KEY,
      bitbucketPublicKey: process.env.BITBUCKET_PUBLIC_KEY,
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
      }
    }
  },
  test: {
    AppName: 'pushdeploy-api',
    AppDomain: process.env.API_URL,
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
      stripePlanA: process.env.STRIPE_PLAN_A || 'Pushdeploy-test',
      stripePlanADesc: 'Deploy test $1/Month',
      stripePlanB: process.env.STRIPE_PLAN_B || 'plan_HDd9VVjQJAYNmu',
      stripePlanBDesc: 'Deploy Pro $4.99/Month',
      stripePlanAAmount: '100',
      stripePlanBAmount: '499',
      githubPublicKey: process.env.GITHUB_PUBLIC_KEY,
      bitbucketPublicKey: process.env.BITBUCKET_PUBLIC_KEY,
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
      }
    }
  },
  staging: {
    AppName: 'pushdeploy-api',
    AppDomain: process.env.API_URL,
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
      stripePlanA: process.env.STRIPE_PLAN_A || 'plan_HDfzkKEuGMYgs3',
      stripePlanADesc: 'Deploy test $1/Month',
      stripePlanB: process.env.STRIPE_PLAN_B || 'plan_HDg0oNkzkvikaq',
      stripePlanBDesc: 'Deploy Pro $4.99/Month',
      stripePlanAAmount: '100',
      stripePlanBAmount: '499',
      githubPublicKey: process.env.GITHUB_PUBLIC_KEY,
      bitbucketPublicKey: process.env.BITBUCKET_PUBLIC_KEY,
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
      }
    }
  },
  production: {
    AppName: 'pushdeploy-api',
    AppDomain: process.env.API_URL,
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
      stripePlanA: process.env.STRIPE_PLAN_A || 'plan_HDfzkKEuGMYgs3',
      stripePlanADesc: 'Deploy test $1/Month',
      stripePlanB: process.env.STRIPE_PLAN_B || 'plan_HDg0oNkzkvikaq',
      stripePlanBDesc: 'Deploy Pro $4.99/Month',
      stripePlanAAmount: '100',
      stripePlanBAmount: '499',
      githubPublicKey: process.env.GITHUB_PUBLIC_KEY,
      bitbucketPublicKey: process.env.BITBUCKET_PUBLIC_KEY,
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
      }
    }
  }
};


module.exports = config[env];