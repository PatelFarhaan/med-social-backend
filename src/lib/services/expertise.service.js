const db = require('../../db/models')
const UserExpertise = require('../../db/models/UserExpertise')
const logger = require('../utils/logger')

const LIMIT = 50

const getExpertise = async ({ id }, loaderOpts) => db.Expertise.findByPk(id, loaderOpts)

const getExpertises = async ({ page = 1, limit = LIMIT, sortBy, sortDirection, includeNonApproved }, loaderOpts) => {
  let order = [['name', 'ASC']]

  const sortFilters = {
    name: direction => [['name', direction.toUpperCase()]],
    createdAt: direction => [['createdAt', direction.toUpperCase()]]
  }

  if (Object.hasOwnProperty.call(sortFilters, sortBy)) {
    order = sortFilters[sortBy](sortDirection)
  }

  const query = {}

  if (!includeNonApproved) {
    query.where = { isApproved: true }
  }

  return db.Expertise.findAndCountAll({
    query,
    limit,
    offset: limit * (page - 1),
    order,
    ...loaderOpts,
    attributes: ['id', 'name', 'createdAt']
  })
}

const createExpertise = async ({ body: { name, interests }, Expertise = db.Expertise }) => {
  let expertise
  try {
    expertise = await Expertise.create({ name })
    const dbInterests = await db.Interest.findAll({ where: { id: interests } })
    await expertise.addInterest(dbInterests)
  } catch (e) {
    logger.warn(`createExpertise: ${e}`)
    throw e
  }
  return expertise
}

const setExpertisePrimary = async (user, expertiseId) => {
  const userExpertises = await user.getUserExpertises()
  const expertise = userExpertises.find(userExpertise => userExpertise.ExpertiseId === parseInt(expertiseId, 10))
  let primaryUserExpertise = userExpertises.find(userExpertise => userExpertise.isPrimary)
  let secondaryUserExpertise = userExpertises.find(userExpertise => userExpertise.isSecondary)
  if (!expertise) {
    return null
  }

  // Check if expertise same as already primary
  if (primaryUserExpertise && expertise.ExpertiseId == primaryUserExpertise.ExpertiseId) {
    return expertise
  }
  // Check if expertise is Secondary
  if (secondaryUserExpertise && expertise.ExpertiseId == secondaryUserExpertise.ExpertiseId) {
    secondaryUserExpertise.isPrimary = true
    secondaryUserExpertise.isSecondary = false
    secondaryUserExpertise = await secondaryUserExpertise.save()
    if (primaryUserExpertise) {
      primaryUserExpertise.isPrimary = false
      primaryUserExpertise.isSecondary = false
      primaryUserExpertise.save()
    }
    return secondaryUserExpertise
  }

  // if expertise is neither primary or secondary
  expertise.isPrimary = true
  expertise.isSecondary = false

  return expertise.save()
}

const setExpertiseSecondary = async (user, expertiseId) => {
  const userExpertises = await user.getUserExpertises()
  let expertise = userExpertises.find(userExpertise => userExpertise.ExpertiseId === parseInt(expertiseId, 10))
  let primaryUserExpertise = userExpertises.find(userExpertise => userExpertise.isPrimary)
  let secondaryUserExpertise = userExpertises.find(userExpertise => userExpertise.isSecondary)

  //Check if already secondary
  if (secondaryUserExpertise && expertise.ExpertiseId == secondaryUserExpertise.ExpertiseId) {
    return expertise
  }
  // only 1
  if (userExpertises.length == 1) {
    return null
  }

  // Primary is set to secondary
  if (primaryUserExpertise && expertise.ExpertiseId == primaryUserExpertise.ExpertiseId) {
    expertise.isSecondary = true
    expertise.isPrimary = false
    expertise.save()
    if (secondaryUserExpertise) {
      secondaryUserExpertise.isSecondary = false
      secondaryUserExpertise.save()
    }
    return expertise
  }
  expertise.isSecondary = true

  if (secondaryUserExpertise) {
    secondaryUserExpertise.isPrimary = false
    secondaryUserExpertise.isSecondary = false
    await secondaryUserExpertise.save()
  }
  return expertise.save()
}

module.exports = {
  getExpertises,
  createExpertise,
  getExpertise,
  setExpertisePrimary,
  setExpertiseSecondary
}
