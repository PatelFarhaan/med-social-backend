const jwt = require('jsonwebtoken')
const moment = require('moment')
const config = require('../../../config/config')
const { getUser } = require('../users/retrieval')
const db = require('../../db/models')
const { tokenTypes } = require('../constants/token.constant')

const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type
  }
  return jwt.sign(payload, secret)
}

const saveToken = async (token, userId, expires, type, blacklisted = false) => {
  const tokenDoc = await db.Session.create({
    token,
    userId,
    expires: expires.toDate(),
    type,
    blacklisted
  })
  return tokenDoc
}

const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, config.jwt.secret)
  const tokenDoc = await db.Session.findOne({ token, type, user: payload.sub, blacklisted: false })
  if (!tokenDoc) {
    throw new Error('Token not found')
  }
  return tokenDoc
}

const generateAuthTokens = async user => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes')
  const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS)

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days')
  const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH)
  await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH)

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate()
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate()
    }
  }
}

const generateResetPasswordToken = async email => {
  const user = await getUser({ email })
  if (!user) {
    throw new Error(JSON.stringify({ status: 404, message: 'User not found' }))
  }
  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes')
  const resetPasswordToken = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD)
  await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD)
  return resetPasswordToken
}

module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken
}
