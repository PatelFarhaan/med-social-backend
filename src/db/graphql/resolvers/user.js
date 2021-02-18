// Resolvers: A map of functions which return data for the schema.
const { authenticate, getUsers, exportSafeUser, signup } = require('../../../lib/users')
const { tokenService } = require('../../../lib/services')
const { getTenantSettings } = require('../../../lib/settings')
const { can } = require('./../auth')
const { tokenTypes } = require('../../../../config/constants')

const getUserSettings = async userSettings => {
  const defaultSettings = await getTenantSettings('user.defaults')
  return Object.assign(defaultSettings, userSettings)
}

module.exports = {
  Query: {
    login: async (_parent, { email, password }) => {
      const rawUser = await authenticate(email, password)
      const user = exportSafeUser(rawUser)
      const tokens = await tokenService.generateAuthTokens(user)
      user.settings = await getUserSettings(user.settings)
      return {
        user,
        tokens
      }
    },
    getUser: can('superadmin').createResolver(async (_parent, _args, { db, req }) => {
      const user = await db.User.findOne({ where: { id: req.user.id } })
      user.settings = await getUserSettings(user.settings)
      return user
    }),
    getUsers: can('superadmin').createResolver(async (_parent, args, { req }) => {
      const rawUsers = await getUsers(args, req.user.id)
      const users = rawUsers.rows.map(user => exportSafeUser(user))
      return {
        list: users,
        count: users.length
      }
    })
  },
  Mutation: {
    updateUser: can('superadmin').createResolver(async (_parent, args, { req }) => {
      if (args.settings) {
        args.settings = Object.assign(req.User.settings, args.settings)
      }
      const user = await req.User.update(args, { returning: true })
      user.settings = await getUserSettings(user.settings)
      return user
    }),
    createUser: async (_parent, body) => {
      const user = await signup({ body })
      const tokens = await tokenService.generateAuthTokens(user)
      return {
        user,
        tokens
      }
    },
    refreshAuth: async (_parent, { refreshToken }, { db }) => {
      try {
        const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH)
        const user = await db.User.findOne({ where: { id: refreshTokenDoc.user.id } })
        if (!user) {
          throw new Error(JSON.stringify({ status: 404, message: 'User not found' }))
        }
        await refreshTokenDoc.remove()
        return tokenService.generateAuthTokens(user)
      } catch (error) {
        throw new Error(JSON.stringify({ status: 401, message: 'Please authenticate' }))
      }
    }
  }
}
