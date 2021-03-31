const { v4: uuidv4 } = require('uuid')
const base64url = require('base64url')
const db = require('../../db/models')

const {
  stripe: { paidSubscriptionPriceId }
} = require('../../../config/config')
const { states } = require('../constants/invitation.constant')
const logger = require('../utils/logger')
const stripeService = require('./stripe.service')
const emailService = require('./email.service')

const LIMIT = 50

const getInvitation = async ({ token }, loaderOpts) => db.Invitation.findOne({ where: { token, state: states.APPROVED } }, loaderOpts)

const getInvitations = async ({ page = 1, limit = LIMIT, sortBy, sortDirection }, loaderOpts) => {
  let order = [['createdAt', 'ASC']]

  const sortFilters = {
    state: direction => [['state', direction.toUpperCase()]],
    createdAt: direction => [['createdAt', direction.toUpperCase()]]
  }

  if (Object.hasOwnProperty.call(sortFilters, sortBy)) {
    order = sortFilters[sortBy](sortDirection)
  }

  return db.Invitation.findAndCountAll({
    limit,
    offset: limit * (page - 1),
    order,
    ...loaderOpts
  })
}

const createInvitation = async (
  { firstName, lastName, email, expertise, samplePosts, note, special, type },
  Invitation = db.Invitation,
  User = db.User,
  Expertise = db.Expertise
) => {
  const existingUser = await User.findOne({ where: { email } })
  if (existingUser) {
    throw new Error(JSON.stringify({ status: 400, message: 'User already exists' }))
  }
  if (type === undefined) {
    type = 'REGULAR'
  }
  const existingInvitation = await Invitation.findOne({ where: { email, type, state: states.PENDING } })
  if (existingInvitation) {
    throw new Error(JSON.stringify({ status: 400, message: 'Invitation already exists' }))
  }

  let invitation
  try {
    invitation = await Invitation.create({
      firstName,
      lastName,
      email,
      samplePosts,
      note,
      special,
      type
    })

    const existingExpertise = await Expertise.findOne({ where: { name: expertise } })

    const invitationExpertise = existingExpertise || (await Expertise.create({ name: expertise }))

    invitation.addExpertise(invitationExpertise)
    invitation.save()

    await emailService.sendEmail(this.email, { firstName: this.firstName }, 'invitationRequested')
  } catch (e) {
    logger.warn(`createInvitation ${e}`)
  }

  return invitation
}

const approveInvitation = async (email, _user, Invitation = db.Invitation) => {
  const invitation = await Invitation.findOne({ where: { email } })
  if (!invitation) {
    throw new Error(JSON.stringify({ status: 404, message: 'Invitation not found' }))
  }

  let savedInvitation
  try {
    if (invitation.state === states.PENDING) {
      invitation.state = states.APPROVED
      const token = await generateToken()
      console.warn('token', token)
      invitation.token = token
      // TODO: Add approved by when you add the authentication
      // Model.approvedBy = approvedBy
      savedInvitation = await invitation.save()
      if (invitation.special) {
        await emailService.sendEmail(
          invitation.email,
          { firstName: invitation.firstName, linkToOnboarding: `${process.env.MOCK_WEBCLIENT_HOST}/onboarding?token=${token}` },
          'nomDePlumeConfirmed'
        )
      } else {
        await emailService.sendEmail(
          invitation.email,
          { firstName: invitation.firstName, linkToOnboarding: `${process.env.MOCK_WEBCLIENT_HOST}/onboarding?token=${token}` },
          'invitationConfirmed'
        )
      }
    }
  } catch (e) {
    logger.warn(`savedInvitation ${e}`)
    throw e
  }

  return savedInvitation
}

// const inviteUserToColumn = async ({ body: { firstName, lastName, email, column } }, user, Invitation = db.Invitation) => {
//   const invitation = await Invitation.findOne({ where: { email } })
//   if (!invitation) {
//     throw new Error(JSON.stringify({ status: 404, message: 'Invitation not found' }))
//   }

//   let savedInvitation
//   try {
//     // savedInvitation = await invitation.approve(user)
//     if (invitation.state === states.PENDING) {
//       invitation.state = states.APPROVED
//       const token = generateToken()
//       invitation.token = token
//       // TODO: Add approved by when you add the authentication
//       // Model.approvedBy = approvedBy
//       savedInvitation = await invitation.save()
//       if (invitation.special) {
//         await emailService.sendEmail(
//           invitation.email,
//           { firstName: invitation.firstName, linkToOnboarding: `${process.env.MOCK_WEBCLIENT_HOST}/onboarding?token=${token}` },
//           'nomDePlumeConfirmed'
//         )
//       } else {
//         await emailService.sendEmail(
//           invitation.email,
//           { firstName: invitation.firstName, linkToOnboarding: `${process.env.MOCK_WEBCLIENT_HOST}/onboarding?token=${token}` },
//           'invitationConfirmed'
//         )
//       }
//     }
//   } catch (e) {
//     logger.warn(`savedInvitation ${e}`)
//     throw e
//   }

//   return savedInvitation
// }

const rejectInvitation = async (email, _user, Invitation = db.Invitation) => {
  const invitation = await Invitation.findOne({ where: { email } })
  if (!invitation) {
    throw new Error(JSON.stringify({ status: 404, message: 'Invitation not found' }))
  }

  let savedInvitation
  try {
    if (invitation.special) {
      invitation.special = false
      // TODO: Add approved by when you add the authentication
      // this.approvedBy = approvedBy
      const token = await generateToken()
      invitation.token = token
      invitation.state = states.APPROVED
      savedInvitation = await invitation.save()
      await emailService.sendEmail(
        this.email,
        { firstName: this.firstName, linkToOnboarding: `${process.env.MOCK_WEBCLIENT_HOST}/onboarding?token=${token}` },
        'nomDePlumeRejected'
      )
    } else {
      invitation.state = states.REJECTED
      await invitation.save()
      await emailService.sendEmail(invitation.email, { firstName: invitation.firstName }, 'invitationRejected')
    }
  } catch (e) {
    logger.warn(`savedInvitation ${e}`)
    throw e
  }

  return savedInvitation
}

const payForApproval = async (paymentMethod, email, Invitation = db.Invitation, Subscription = db.Subscription) => {
  try {
    const invitation = await Invitation.findOne({ where: { email, state: states.PENDING } })
    if (!invitation) {
      throw new Error(JSON.stringify({ status: 404, message: 'Invitation not found' }))
    }

    const stripeCustomer = await stripeService.createCustomer({ email }, paymentMethod)

    await stripeService.attachPaymentMethod(stripeCustomer.id, paymentMethod)

    const stripeSubscription = await stripeService.createSubscription(stripeCustomer.id, paidSubscriptionPriceId)

    if (stripeSubscription.latest_invoice.payment_intent.status !== 'cancelled') {
      const approvedInvitation = await invitation.approve()

      const subscription = await Subscription.create({
        paymentMethod,
        paymentGateway: 'STRIPE',
        type: 'PAID_INVITATION',
        customerId: stripeCustomer.id,
        subscriptionId: stripeSubscription.id,
        email
      })

      await approvedInvitation.setSubscription(subscription)

      return {
        subscription: stripeSubscription,
        token: approvedInvitation.token
      }
    }
    return {
      subscription: stripeSubscription,
      token: null
    }
  } catch (e) {
    logger.info(`payForApproval ${e}`)
    throw e
  }
}

const resendInvitationEmail = async ({ email }, loaderOpts) => {
  const invitation = await db.Invitation.findOne({ where: { email, state: states.APPROVED } }, loaderOpts)
  if (!invitation) {
    throw new Error(JSON.stringify({ status: 404, message: 'Invitation not found' }))
  }

  return {
    status: 204
  }
}

const updateSamplePosts = async ({ email, samplePosts }, loaderOpts) => {
  const invitation = await db.Invitation.findOne({ where: { email, state: states.PENDING } }, loaderOpts)
  if (!invitation) throw new Error(JSON.stringify({ status: 404, message: 'Invitation not found' }))
  if (invitation.samplePosts.length > 0) throw new Error(JSON.stringify({ status: 400, message: 'Invitation sample posts already exists' }))

  try {
    invitation.samplePosts = samplePosts
    await invitation.save()
  } catch (e) {
    logger.info(`updateSamplePosts ${e}`)
    throw e
  }

  return {
    status: 204,
    message: 'Successfully updated sample posts'
  }
}

const generateToken = async () => base64url(uuidv4())

module.exports = {
  createInvitation,
  approveInvitation,
  getInvitations,
  getInvitation,
  payForApproval,
  resendInvitationEmail,
  rejectInvitation,
  updateSamplePosts
  // inviteUserToColumn
}
