// Resolvers: A map of functions which return data for the schema.
const { authenticate, authenticateToken, getUsers, exportSafeUser, signup, setPassword } = require('../../../lib/users')
const { tokenService, emailService, socialService, stripeService, uploadService } = require('../../../lib/services')
const { getTenantSettings } = require('../../../lib/settings')
const { can } = require('./../auth')
const { tokenTypes } = require('../../../lib/constants/token.constant')
const { exportSafeModel } = require('../../../lib/utils/exportSafeModel')
const { subscriptionStatuses, subscriptionTypes } = require('../../../lib/constants/subscription.constant')

const getUserSettings = async userSettings => {
  const defaultSettings = await getTenantSettings('user.defaults')
  return Object.assign(defaultSettings, userSettings)
}

const userProviderAttributes = {
  google: 'googleUserId',
  twitter: 'twitterUserId',
  linkedin: 'linkedinUserId'
}

module.exports = {
  Query: {
    login: async (_parent, { token, email, password }) => {
      let rawUser
      if (token) {
        rawUser = await authenticateToken(email, token)
      } else {
        rawUser = await authenticate(email, password)
      }
      const user = exportSafeUser(rawUser)
      const tokens = await tokenService.generateAuthTokens(user)
      user.settings = await getUserSettings(user.settings)
      return {
        user,
        tokens
      }
    },
    getMagicLink: async (_parent, { email }) => {
      const { user, token } = await tokenService.generateMagicLinkToken(email)
      await emailService.sendEmail(
        user.email,
        { firstName: user.firstName, linkToLogin: `${process.env.MOCK_WEBCLIENT_HOST}/login?token=${token}&email=${user.email}` },
        'magicLink'
      )
      return {
        status: 200,
        message: 'Email Sent'
      }
    },
    getUser: can('standard').createResolver(async (_parent, _args, { db, req }) => {
      const user = await db.User.findOne({ where: { id: req.user.id } })
      user.settings = await getUserSettings(user.settings)
      return user
    }),
    getUserColumns: can('standard').createResolver(async (_parent, { limit = 10, page = 1 }, { db, req }) => {
      const { user } = req
      const userColumnSubscriptions = await user.getSubscriptions({
        attributes: ['ColumnSlug', 'id'],
        where: { state: subscriptionStatuses.ACTIVE, type: subscriptionTypes.COLUMN },
        limit,
        page
      })

      const rawColumns = await db.Column.findAll({ where: { slug: userColumnSubscriptions.map(item => item.ColumnSlug) } })
      return rawColumns.map(column => exportSafeModel(column))
    }),
    getUsers: can('superadmin').createResolver(async (_parent, args, { req }) => {
      const rawUsers = await getUsers(args, req.user.id)
      const users = rawUsers.rows.map(user => exportSafeUser(user))
      return {
        list: users,
        count: rawUsers.count
      }
    }),
    socialLogin: async (_parent, { provider, token }, { db }) => {
      if (!['google'].includes(provider)) throw new Error(JSON.stringify({ status: 400, message: 'Provider not supported' }))
      const ticket = await socialService.googleTokenVerify(token)
      const socialId = await ticket.getUserId()
      const rawUser = await db.User.findOne({ where: { [userProviderAttributes[provider]]: socialId } })
      const user = exportSafeUser(rawUser)
      const tokens = await tokenService.generateAuthTokens(user)
      return {
        user,
        tokens
      }
    },
    socialOnboarding: async (_parent, { provider, token }) => {
      if (!['google'].includes(provider)) throw new Error(JSON.stringify({ status: 400, message: 'Provider not supported' }))
      const ticket = await socialService.googleTokenVerify(token)
      const socialId = await ticket.getUserId()
      const attributes = await ticket.getAttributes()
      return {
        id: socialId,
        attributes
      }
    },
    searchByUsername: can('standard').createResolver(async (_parent, { query }, { db }) => {
      const rawUsers = await db.User.search(query)
      return rawUsers[1].rows.map(item => ({
        username: item.username,
        firstName: item.first_name,
        lastName: item.last_name,
        profileDescription: item.profile_description
      }))
    }),
    isUsernameTaken: async (_parent, { query }, { db }) => {
      const rawUser = await db.User.findOne({ where: { username: query } })
      return !!rawUser
    }
  },
  Mutation: {
    connectPaymentMethod: can('standard').createResolver(async (_parent, { paymentMethod }, { req }) => {
      const { user } = req
      const stripeCustomer = await stripeService.createCustomer({ email: user.email }, paymentMethod)
      await stripeService.attachPaymentMethod(stripeCustomer.id, paymentMethod)
      user.stripeCustomerId = stripeCustomer.id
      user.paymentMethod = paymentMethod
      const savedUser = await user.save()
      return savedUser
    }),
    connectSocial: can('standard').createResolver(async (_parent, { provider, token }, { req }) => {
      // TODO: Add other socials
      if (!['google'].includes(provider)) throw new Error(JSON.stringify({ status: 400, message: 'Provider not supported' }))
      const ticket = await socialService.googleTokenVerify(token)
      const socialId = await ticket.getUserId()
      const { user } = req
      user.googleUserId = socialId
      const savedUser = await user.save()
      return savedUser
    }),
    disconnectSocial: can('standard').createResolver(async (_parent, { provider }, { req }) => {
      if (!['google', 'twitter'].includes(provider)) throw new Error(JSON.stringify({ status: 400, message: 'Provider not supported' }))
      const { user } = req
      user[userProviderAttributes[provider]] = null
      const savedUser = await user.save()
      return savedUser
    }),
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
        const user = await db.User.findOne({ where: { id: refreshTokenDoc.userId } })
        if (!user) {
          throw new Error(JSON.stringify({ status: 404, message: 'User not found' }))
        }
        await refreshTokenDoc.destroy()
        return { tokens: await tokenService.generateAuthTokens(user) }
      } catch (error) {
        throw error
      }
    },
    uploadProfilePicture: can('standard').createResolver(async (_parent, args, { req }) => {
      const { user } = req
      const uploadedFile = await uploadService.processUploadS3(args.file, 'USER')
      user.profilePicture = uploadedFile.location
      const savedUser = await user.save()
      return exportSafeModel(savedUser)
    }),
    setPassword: can('standard').createResolver(async (_parent, { password }, { req }) => {
      const { user } = req
      if (user.hash) throw new Error(JSON.stringify({ status: 400, message: 'Password has already been set' }))
      const savedUser = await setPassword(user, password)
      return exportSafeModel(savedUser)
    })
  },
  User: {
    expertises: (user, _args, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const dbUser = db.User.build(exportSafeModel(user))
      return dbUser.getExpertises({ [EXPECTED_OPTIONS_KEY]: context })
    },
    userExpertises: (user, _args, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const dbUser = db.User.build(exportSafeModel(user))
      return dbUser.getUserExpertises({ [EXPECTED_OPTIONS_KEY]: context })
    }
  },
  UserExpertise: {
    user: (userExpertise, _args, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const dbUserExpertise = db.UserExpertise.build(userExpertise)
      return dbUserExpertise.getUser({ [EXPECTED_OPTIONS_KEY]: context })
    },
    expertise: (userExpertise, _args, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const dbUserExpertise = db.UserExpertise.build(userExpertise)
      return dbUserExpertise.getExpertise({ [EXPECTED_OPTIONS_KEY]: context })
    }
  }
}
