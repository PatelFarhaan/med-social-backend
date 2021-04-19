const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')
const { env } = require('../../../config/config')
const db = require('../../db/models/')
const { getTenantSetting } = require('../settings')
const { states, invitationTypes } = require('../constants/invitation.constant')
const { subscriptionStatuses } = require('../constants/subscription.constant')
const { tokenTypes } = require('../constants/token.constant')
const logger = require('../utils/logger')
const { calculatePoints } = require('../services/reputation.service')
const { reputationSources } = require('../constants/reputation.constant')

const BCRYPT_SALT_ROUNDS = 10

const signup = async ({ body = {}, User = db.User, Invitation = db.Invitation, Subscription = db.Subscription }) => {
  const { email, password, interests, expertises, passwordRepeat, roleId = 3, token, isSeed = false } = body

  let invitation
  let subscription

  if (!isSeed && env !== 'test') {
    invitation = await Invitation.findOne({ where: { token, state: states.APPROVED } })

    if (!invitation) throw new Error(JSON.stringify({ status: 422, message: 'Need valid token' }))

    if (invitation.type === invitationTypes.PAID) {
      subscription = await Subscription.findOne({ where: { email, state: subscriptionStatuses.ACTIVE } })
      if (!subscription) throw new Error(JSON.stringify({ status: 422, message: 'Need valid subscription' }))
    }
  }

  // if (!roleId) throw new Error(JSON.stringify({ status: 422, message: 'Need role for user' }))
  const user = await User.build({ ...body, roleId })

  // Check if user email is unique
  if ((await User.count({ where: { email } })) > 0) {
    throw new Error(JSON.stringify({ status: 409, message: 'User with that email already exists' }))
  }

  if (password && passwordRepeat) {
    if (password !== passwordRepeat) throw new Error(JSON.stringify({ status: 400, message: 'Expected passwords to match' }))
    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS)
    user.hash = await bcrypt.hash(password, salt)
  }

  let savedUser
  try {
    // Save
    savedUser = await user.save()

    if (interests) {
      const dbInterests = await db.Interest.findAll({ where: { id: interests } })
      await savedUser.addInterest(dbInterests)
    }

    if (expertises) {
      const dbExpertises = await db.Expertise.findAll({ where: { id: expertises } })
      await savedUser.addExpertise(dbExpertises)
      await calculatePoints(savedUser, dbExpertises[0], reputationSources.ONBOARDED)
    }

    if (!isSeed && env !== 'test') {
      invitation.state = states.COMPLETED
      await invitation.save()

      if (invitation.type === invitationTypes.PAID && subscription) {
        savedUser.stripeCustomerId = subscription.customerId
        savedUser.paymentMethod = subscription.paymentMethod
        await savedUser.save()
        await subscription.addUser(savedUser)
        await subscription.save()
      }
    }
  } catch (e) {
    logger.warn(`signup ${e}`)
  }
  return savedUser
}

const authenticate = async (email, password) => {
  if (!email) throw new Error(JSON.stringify({ status: 400, message: 'Email cannot be blank' }))
  if (!password || !password.length) throw new Error(JSON.stringify({ status: 400, message: 'Password cannot be blank' }))

  const user = await db.User.findOne({
    where: {
      [Op.or]: [{ email: email.toLowerCase() }, { username: email.toLowerCase() }],
      deactivatedAt: null
    },
    include: [
      {
        model: db.Role,
        as: 'role',
        attributes: ['id', 'type', 'createdAt', 'updatedAt']
      }
    ]
  })
  if (user) {
    const comparison = await bcrypt.compare(password, user.hash)
    if (comparison === true) {
      return { ...user.toJSON(), roles: [user.role.type] }
    }
  }
  throw new Error(JSON.stringify({ status: 404, message: 'Incorrect email or password' }))
}

const authenticateToken = async (email, token) => {
  if (!email) throw new Error(JSON.stringify({ status: 400, message: 'Email cannot be blank' }))
  if (!token) throw new Error(JSON.stringify({ status: 400, message: 'Token cannot be blank' }))

  const session = await db.Session.findOne({
    where: {
      token,
      type: tokenTypes.MAGIC_LINK
    }
  })
  if (!session) throw new Error(JSON.stringify({ status: 404, message: 'Token not found' }))

  const user = await session.getUser({
    include: [
      {
        model: db.Role,
        as: 'role',
        attributes: ['id', 'type', 'createdAt', 'updatedAt']
      }
    ]
  })

  if (email !== user.email) throw new Error(JSON.stringify({ status: 400, message: 'Incorrect email or token' }))
  await session.destroy()
  return {
    ...user.toJSON(),
    roles: [user.role.type]
  }
}

const inviteUser = async (email, role, firstName = '', lastName = '') => {
  // encode email with tenant's jwt secret
  // make a call to Mandrill with invitationToken as part of payload or something
  const jwtSecret = await getTenantSetting('tenant.jwt.secret')
  const token = jwt.sign({ email, role, firstName, lastName }, jwtSecret, { expiresIn: '7d' })

  if ((await db.User.count({ where: { email } })) > 0) {
    throw new Error(JSON.stringify({ status: 409, message: 'User with that email already exists' }))
  }

  return {
    email,
    firstName,
    lastName,
    token,
    fromFirstName: '',
    fromLastName: ''
  }
}

const forgotPassword = async user => jwt.sign({ userId: user.id }, user.hash, { expiresIn: '24h' })

const resetPassword = async (user, resetPasswordToken, newPassword) => {
  const payload = jwt.verify(resetPasswordToken, user.hash)
  if (!payload || payload.userId !== user.id) {
    throw new Error(JSON.stringify({ status: 403, message: 'Invalid reset password token given, could not reset password' }))
  }
  await setPassword(user, newPassword)
  return user.save()
}

const setPassword = async (user, newPassword) => {
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS)
  const hash = await bcrypt.hash(newPassword, salt)
  user.set({ hash })
  return user.save()
}

const updateUser = async (userId, body) => {
  const rawUser = await db.User.findOne({
    where: {
      id: userId
    },
    include: [
      {
        model: db.Role,
        as: 'role',
        required: false,
        attributes: ['id', 'type', 'createdAt', 'updatedAt']
      }
    ]
  })
  if (!rawUser) {
    throw new Error(JSON.stringify({ status: 400, message: 'No such user when updating user' }))
  }

  if (body.email) {
    const doesEmailExist = await db.User.count({
      where: {
        id: {
          [db.sequelize.Op.ne]: userId
        },
        email: body.email
      }
    })
    if (doesEmailExist) throw new Error(JSON.stringify({ status: 409, message: 'Cannot update user, email already exists' }))
  }

  rawUser.set(body)
  try {
    await rawUser.save()
  } catch (e) {
    logger.warn(`updateUser ${e}`)
  }
  return rawUser
}

const updatePrimaryUserRole = async (userId, roleId) => {
  const user = await db.User.findOne({ where: { id: userId } })
  try {
    await user.update({ roleId })
  } catch (e) {
    logger.warn(`updatePrimaryUserRole ${e}`)
  }

  return db.User.findOne({
    where: { id: userId },
    include: [
      {
        model: db.Role,
        as: 'role',
        attributes: ['id', 'type', 'createdAt', 'updatedAt']
      }
    ]
  })
}

module.exports = {
  signup,
  authenticate,
  inviteUser,
  forgotPassword,
  resetPassword,
  setPassword,
  updateUser,
  updatePrimaryUserRole,
  authenticateToken
}
