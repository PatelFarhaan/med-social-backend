const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')
// const { Strategy: TwitterStrategy } = require('passport-twitter-oauth2')
// const { Strategy: LinkedinStrategy } = require('passport-linkedin-oauth2')
// const { Strategy: GoogleStrategy } = require('passport-google-oauth20')
const config = require('../../config/config')
const db = require('../db/models/')
const { tokenTypes } = require('../lib/constants/token.constant')

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type')
    }
    const user = await db.User.findByPk(payload.sub, {
      include: [
        {
          model: db.Role,
          as: 'role',
          attributes: ['id', 'type'],
          required: false
        }
      ]
    })
    if (!user) {
      return done(null, false)
    }
    return done(null, user)
  } catch (error) {
    return done(error, false)
  }
}

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify)

// const twitterStrategy = new TwitterStrategy(
//   {
//     clientID: '***REMOVED***',
//     clientSecret: '***REMOVED***',
//     callbackURL: `http://localhost:3005/auth/twitter/callback`, // this will need to be dealt with
//     includeEmail: true
//   },
//   (token, tokenSecret, profile, done) => {
//     console.warn("twitter profile", profile, token, tokenSecret)
//     process.nextTick(() => done(null, profile))
//     // User.findOrCreate(..., function(err, user) {
//     //   if (err) { return done(err); }
//     //   done(null, user);
//     // });
//   }
// )

// const linkedinStrategy = new LinkedinStrategy(
//   {
//     clientID: '***REMOVED***',
//     clientSecret: '***REMOVED***',
//     callbackURL: `http://localhost:3005/auth/linkedin/callback`, // this will need to be dealt with
//     scope: ['r_emailaddress', 'r_liteprofile']
//   },
//   (token, tokenSecret, profile, done) => {
//     console.warn("linkedin profile", profile, token, tokenSecret)
//     process.nextTick(() => done(null, profile))
//     // User.findOrCreate(..., function(err, user) {
//     //   if (err) { return done(err); }
//     //   done(null, user);
//     // });
//   }
// )

// const googleStrategy = new GoogleStrategy(
//   {
//     clientID: '***REMOVED***-u9jmhk4k8eh02kinnf6c992lbg72am8a.apps.googleusercontent.com',
//     clientSecret: '***REMOVED***',
//     callbackURL: `http://localhost:3005/auth/google/callback`, // this will need to be dealt with
//     scope: ['profile', 'email']
//   },
//   (token, tokenSecret, profile, done) => {
//     console.warn("google profile", profile, token, tokenSecret)
//     process.nextTick(() => done(null, profile))
//     // User.findOrCreate(..., function(err, user) {
//     //   if (err) { return done(err); }
//     //   done(null, user);
//     // });
//   }
// )

module.exports = {
  jwtStrategy,
  jwtVerify,
  tokenTypes
  // twitterStrategy,
  // linkedinStrategy,
  // googleStrategy
}
