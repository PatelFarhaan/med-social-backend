const jwt = require('jsonwebtoken')
const moment = require('moment')
const config = require('../../../config/config')
const { getUser, getUserWithoutRole } = require('../users/retrieval')
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
  const tokenDoc = await db.Session.findOne({ where: { token, type, userId: payload.sub, blackListed: false } })
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

const generateMagicLinkToken = async email => {
  const user = await getUserWithoutRole({ email })
  if (!user) throw new Error(JSON.stringify({ status: 404, message: 'User not found' }))
  const existingMagicLink = await db.Session.findOne({ where: { userId: user.id, type: tokenTypes.MAGIC_LINK } })
  if (existingMagicLink) return { token: existingMagicLink.token, user }
  const expires = moment().add(config.jwt.magicLinkExpirationMinutes, 'minutes')
  const magicLinkToken = generateToken(user.id, expires, tokenTypes.MAGIC_LINK)
  await saveToken(magicLinkToken, user.id, expires, tokenTypes.MAGIC_LINK)
  return {
    token: magicLinkToken,
    user
  }
}

module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateMagicLinkToken
}
