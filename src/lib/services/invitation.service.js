const { v4: uuidv4 } = require('uuid')
const base64url = require('base64url')
const db = require('../../db/models')

const {
  stripe: { paidSubscriptionPriceId }
} = require('../../../config/config')
const { states } = require('../constants/invitation.constant')
const logger = require('../utils/logger')
const columnService = require('./column.service')
const stripeService = require('./stripe.service')
const emailService = require('./email.service')
const { columnTypes } = require('../constants/column.constant')
const { invitationTypes, invitationStates } = require('../constants/invitation.constant')

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
  { firstName, lastName, email, expertise, fellow, note, special, type, verificationLink },
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
    const existingExpertise = await Expertise.findOne({ where: { name: expertise } })
    const invitationExpertise = existingExpertise || (await Expertise.create({ name: expertise }))

    invitation = await Invitation.create({
      firstName,
      lastName,
      email,
      fellow,
      note,
      special,
      type,
      verificationLink
    })

    await invitation.addExpertise(invitationExpertise)

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

const inviteUserToColumn = async (
  { firstName, lastName, expertise, email, columnSlug },
  user,
  Column = db.Column,
  User = db.User,
  Invitation = db.Invitation,
  Expertise = db.Expertise
) => {
  const existingInvitation = await Invitation.findOne({ where: { email, columnSlug, state: states.PENDING } })
  if (existingInvitation) {
    throw new Error(JSON.stringify({ status: 400, message: 'Invitation already exists' }))
  }

  const column = await Column.findByPk(columnSlug)
  if (!column) throw new Error(JSON.stringify({ status: 404, message: 'Column already exists' }))

  const existingUser = await User.findOne({ email })

  if (existingUser) {
    const columnAuthor = await column.getAuthor()
    if (column.type === columnTypes.PAID && columnAuthor.id !== user.id)
      throw new Error(JSON.stringify({ status: 403, message: 'Only Column owners in paid columns can invite users' }))

    await columnService.subscribeToColumn({ body: { email } }, existingUser)
    return {
      status: 204,
      message: 'Successfully Subscribed User to Column'
    }
  }

  const existingExpertise = await Expertise.findOne({ where: { name: expertise } })
  const invitationExpertise = existingExpertise || (await Expertise.create({ name: expertise }))
  const token = await generateToken()
  const invitation = await Invitation.create({
    firstName,
    lastName,
    email,
    type: invitationTypes.REGULAR,
    state: invitationStates.APPROVED,
    token
  })

  const columnExpertise = await column.getExpertise()

  await invitation.addExpertises([invitationExpertise, columnExpertise])

  await emailService.sendEmail(
    invitation.email,
    { firstName: invitation.firstName, linkToOnboarding: `${process.env.MOCK_WEBCLIENT_HOST}/onboarding?token=${token}` },
    'invitationConfirmed'
  )

  return {
    status: 204,
    message: 'Successfully invited user to Column'
  }
}

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

const updateFellowApplication = async ({ email, fellow, additionalExpertise }, loaderOpts, Expertise = db.Expertise) => {
  const invitation = await db.Invitation.findOne({ where: { email, state: states.PENDING } }, loaderOpts)
  if (!invitation) throw new Error(JSON.stringify({ status: 404, message: 'Invitation not found' }))
  if (Object.keys(invitation.fellow).length > 0)
    throw new Error(JSON.stringify({ status: 400, message: 'Invitation fellow data already exists' }))

  try {
    if (additionalExpertise) {
      const existingExpertise = await Expertise.findOne({ where: { name: additionalExpertise } })
      const invitationAdditionalExpertise = existingExpertise || (await Expertise.create({ name: additionalExpertise }))
      await invitation.addExpertise(invitationAdditionalExpertise)
    }
    invitation.fellow = fellow
    await invitation.save()
  } catch (e) {
    logger.info(`updateFellowApplication ${e}`)
    throw e
  }

  return {
    status: 204,
    message: 'Successfully updated fellow application'
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
  updateFellowApplication,
  inviteUserToColumn
}
