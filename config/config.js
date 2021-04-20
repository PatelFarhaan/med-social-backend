module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpirationMinutes: process.env.JWT_ACCESS_EXPIRATION_MINUTES || 30,
    refreshExpirationDays: process.env.JWT_REFRESH_EXPIRATION_DAYS || 30,
    resetPasswordExpirationMinutes: 10,
    magicLinkExpirationMinutes: 5
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    endpointSecret: process.env.STRIPE_ENDPOINT_SECRET,
    currency: process.env.STRIPE_CURRENCY,
    applicationFeePercentage: process.env.STRIPE_APPLICATION_FEE_PERCENTAGE,
    paidSubscriptionPriceId: process.env.STRIPE_PAID_SUBSCRIPTION_PRICE_ID
  },
  email: {
    from: process.env.EMAIL_FROM
  },
  aws: {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    postBucket: process.env.AWS_S3_POST_BUCKET,
    userBucket: process.env.AWS_S3_USER_BUCKET
  },
  googleLogin: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL
  },
  linkedinLogin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackUrl: process.env.LINKEDIN_CALLBACK_URL
  },
  twitterLogin: {
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
    callbackUrl: process.env.TWITTER_CALLBACK_URL,
    frontendCallbackUrl: process.env.TWITTER_FRONTEND_CALLBACK_URL
  },
  rebuildHierarchy: process.env.REBUILD_HIERARCHY
}
