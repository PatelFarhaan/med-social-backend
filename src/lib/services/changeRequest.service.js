const moment = require('moment')
const { v4: uuidv4 } = require('uuid')
const base64url = require('base64url')
const config = require('../../../config/config')
const db = require('../../db/models')

const generateToken = async () => base64url(uuidv4())

const saveToken = async (token, table, attribute, change, UserId, expires) =>
  db.ChangeRequest.create({
    token,
    table,
    attribute,
    change,
    UserId,
    expires: expires.toDate()
  })

const createChangeRequest = async (table, attribute, change, UserId) => {
  const dbChangeRequest = await db.ChangeRequest.findOne({ where: { table, attribute, change, UserId } })
  if (dbChangeRequest) throw new Error(JSON.stringify({ status: 400, message: 'Change request already exists' }))
  const token = await generateToken()
  const expires = moment().add(config.changeRequestExpiration, 'days')
  return saveToken(token, table, attribute, change, UserId, expires)
}

const verifyToken = async token => {
  const tokenDoc = await db.ChangeRequest.findOne({ where: { token } })
  if (!tokenDoc) {
    throw new Error('Token not found')
  }
  return tokenDoc
}

module.exports = {
  generateToken,
  saveToken,
  createChangeRequest,
  verifyToken
}
