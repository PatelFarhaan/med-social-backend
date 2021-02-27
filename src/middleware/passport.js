const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')
// const config = require('./config');
const config = require('../../config/config')
// const { User } = require('../models')
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

module.exports = {
  jwtStrategy,
  jwtVerify,
  tokenTypes
}
