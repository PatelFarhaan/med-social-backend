// Resolvers: A map of functions which return data for the schema.
const { Op } = require('sequelize')
const {
  authenticate,
  authenticateToken,
  getUsers,
  exportSafeUser,
  signup,
  setPassword,
  resetPassword,
  passwordChange
} = require('../../../lib/users')
const { tokenService, emailService, socialService, stripeService, uploadService } = require('../../../lib/services')
const { getTenantSettings } = require('../../../lib/settings')
const { can } = require('./../auth')
const { tokenTypes } = require('../../../lib/constants/token.constant')
const { publicFields, privateFields } = require('../../../lib/constants/user.constant')
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
      const { user, token } = await tokenService.generateTypeToken(email, tokenTypes.MAGIC_LINK)
      await emailService.sendEmail(
        user.email,
        { firstName: user.firstName, callToActionUrl: `${process.env.MOCK_WEBCLIENT_HOST}/login?token=${token}&email=${user.email}` },
        'magicLink'
      )
      return {
        status: 200,
        message: 'Email Sent'
      }
    },
    resetPasswordLink: async (_parent, { email }) => {
      const { user, token } = await tokenService.generateTypeToken(email, tokenTypes.RESET_PASSWORD)
      await emailService.sendEmail(
        user.email,
        {
          firstName: user.firstName,
          callToActionUrl: `${process.env.MOCK_WEBCLIENT_HOST}/reset-password?token=${token}&email=${user.email}`
        },
        'userResetPassword'
      )
      return {
        status: 200,
        message: 'Email Sent'
      }
    },
    getUser: async (_parent, { id }, { db, req }) => {
      const attributes = req.user && req.user.id === id ? privateFields : publicFields
      const user = await db.User.findOne({ where: { id }, attributes })
      if (!user) throw new Error(JSON.stringify({ status: 404, message: 'Id provided is not valid' }))
      return user
    },
    getUserColumns: can(['standard', 'admin', 'superadmin']).createResolver(async (_parent, { limit = 10, page = 1 }, { db, req }) => {
      const { user } = req
      const userColumnSubscriptions = await user.getSubscriptions({
        attributes: ['ColumnSlug', 'id'],
        where: { state: subscriptionStatuses.ACTIVE, type: subscriptionTypes.COLUMN },
        limit,
        offset: limit * (page - 1)
      })

      const rawColumns = await db.Column.findAll({
        where: { slug: userColumnSubscriptions.map(item => item.ColumnSlug) },
        attributes: [
          'slug',
          'description',
          'name',
          'createdAt',
          'price',
          'visibility',
          'state',
          'type',
          'authorId',
          'ExpertiseId',
          [db.sequelize.literal('(SELECT COUNT(*) FROM "Subscription" WHERE "Subscription"."ColumnSlug" = slug)'), 'MemberCount'],
          [db.sequelize.literal('(SELECT COUNT(*) FROM "Post" WHERE "Post"."ColumnSlug" = slug)'), 'PostCount']
        ]
      })
      return rawColumns.map(column => exportSafeModel(column))
    }),
    getUsers: can(['admin', 'superadmin']).createResolver(async (_parent, args, { req }) => {
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
    searchByUsername: can(['standard', 'admin', 'superadmin']).createResolver(async (_parent, { query, page = 1, limit = 10 }, { db }) => {
      const rawUsers = await db.User.findAndCountAll({
        where: {
          [Op.or]: [
            {
              username: {
                [Op.iLike]: `%${query.toLowerCase()}%`
              }
            },
            {
              firstName: {
                [Op.iLike]: `%${query.toLowerCase()}%`
              }
            },
            {
              lastName: {
                [Op.iLike]: `%${query.toLowerCase()}%`
              }
            }
          ]
        },
        limit,
        offset: limit * (page - 1)
      })
      return rawUsers.rows.map(user => exportSafeUser(user))
    }),
    isUsernameTaken: async (_parent, { query }, { db }) => {
      const rawUser = await db.User.findOne({ where: { username: query } })
      return !!rawUser
    }
  },
  Mutation: {
    connectPaymentMethod: can(['standard', 'admin', 'superadmin']).createResolver(async (_parent, { paymentMethod }, { req }) => {
      const { user } = req
      const stripeCustomer = await stripeService.createCustomer({ email: user.email }, paymentMethod)
      await stripeService.attachPaymentMethod(stripeCustomer.id, paymentMethod)
      user.stripeCustomerId = stripeCustomer.id
      user.paymentMethod = {
        id: paymentMethod.id,
        name: `${user.firstName} ${user.lastName}`,
        brend: paymentMethod.card.brand,
        expire_year: paymentMethod.card.exp_year,
        expire_month: paymentMethod.card.exp_month,
        last_digits: paymentMethod.card.last4,
        stripe: paymentMethod
      }
      const savedUser = await user.save()
      return savedUser
    }),
    connectSocial: can(['standard', 'admin', 'superadmin']).createResolver(async (_parent, { provider, token }, { req }) => {
      // TODO: Add other socials
      if (!['google'].includes(provider)) throw new Error(JSON.stringify({ status: 400, message: 'Provider not supported' }))
      const ticket = await socialService.googleTokenVerify(token)
      const socialId = await ticket.getUserId()
      const { user } = req
      user.googleUserId = socialId
      const savedUser = await user.save()
      return savedUser
    }),
    disconnectSocial: can(['standard', 'admin', 'superadmin']).createResolver(async (_parent, { provider }, { req }) => {
      if (!['google', 'twitter'].includes(provider)) throw new Error(JSON.stringify({ status: 400, message: 'Provider not supported' }))
      const { user } = req
      user[userProviderAttributes[provider]] = null
      const savedUser = await user.save()
      return savedUser
    }),
    // eslint-disable-next-line camelcase
    updateUser: can(['standard', 'admin', 'superadmin']).createResolver(async (_parent, { email, profile_description }, { req, db }) => {
      // eslint-disable-next-line camelcase
      if (!email && !profile_description)
        throw new Error(JSON.stringify({ status: 400, message: 'Email or profile_description is needed' }))

      const updatePayload = {}
      if (email) updatePayload.email = email
      // eslint-disable-next-line camelcase
      if (profile_description) updatePayload.profileDescription = profile_description
      const updatedUser = await db.User.update(updatePayload, { where: { id: req.user.id }, returning: true, plain: true })
      return updatedUser[1]
    }),
    createUser: async (_parent, body) => {
      const user = await signup({ body, roleId: '3' })
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
    uploadProfilePicture: can(['standard', 'admin', 'superadmin']).createResolver(async (_parent, args, { req }) => {
      const { user } = req
      const uploadedFile = await uploadService.processUploadS3(args.file, 'USER')
      user.profilePicture = uploadedFile.location
      const savedUser = await user.save()
      return exportSafeModel(savedUser)
    }),
    setPassword: can(['standard', 'admin', 'superadmin']).createResolver(async (_parent, { password }, { req }) => {
      const { user } = req
      if (user.hash) throw new Error(JSON.stringify({ status: 400, message: 'Password has already been set' }))
      const savedUser = await setPassword(user, password)
      return exportSafeModel(savedUser)
    }),
    resetPassword: async (_parent, { token, password }) => {
      const savedUser = await resetPassword(token, password)
      return exportSafeModel(savedUser)
    },
    passwordChange: can(['standard', 'admin', 'superadmin']).createResolver(async (_parent, { oldPassword, newPassword }, { req }) =>
      passwordChange(req.user, oldPassword, newPassword)
    )
  },
  User: {
    expertises: async (user, { limit = 1, page = 1 }, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const dbUser = db.User.build(exportSafeModel(user))
      const rawExp = await dbUser.getExpertises({ limit, page, [EXPECTED_OPTIONS_KEY]: context })
      const exp = rawExp.map(item => exportSafeModel(item))
      return exp
    },
    interests: (user, { limit = 1, page = 1 }, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const dbUser = db.User.build(exportSafeModel(user))
      return dbUser.getInterests({ limit, page, [EXPECTED_OPTIONS_KEY]: context })
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
