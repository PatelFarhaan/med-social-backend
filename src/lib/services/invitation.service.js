const db = require('../../db/models')
const { states } = require('../constants/invitation.constant')
const logger = require('../utils/logger')

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

  const existingInvitation = await Invitation.findOne({ where: { email, type } })
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
  } catch (e) {
    logger.warn(`createInvitation ${e}`)
  }

  return invitation
}

const approveInvitation = async (email, user, Invitation = db.Invitation) => {
  const invitation = await Invitation.findOne({ where: { email } })
  if (!invitation) {
    throw new Error(JSON.stringify({ status: 404, message: 'Invitation not found' }))
  }

  let savedInvitation
  try {
    savedInvitation = await invitation.approve(user)
  } catch (e) {
    logger.warn(`savedInvitation ${e}`)
    throw e
  }

  return savedInvitation
}

module.exports = {
  createInvitation,
  approveInvitation,
  getInvitations,
  getInvitation
}
