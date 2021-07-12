const db = require('../../db/models')
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
  const expertise = userExpertises.find(userExpertise => userExpertise.ExpertiseId === expertiseId)
  expertise.isPrimary = true
  const primaryUserExpertise = userExpertises.find(userExpertise => userExpertise.isPrimary)
  const secondaryUserExpertise = userExpertises.find(userExpertise => userExpertise.isSecondary)

  if (primaryUserExpertise) {
    primaryUserExpertise.isPrimary = false
    primaryUserExpertise.isSecondary = true
    await primaryUserExpertise.save()
  }

  if (secondaryUserExpertise) {
    secondaryUserExpertise.isPrimary = false
    secondaryUserExpertise.isSecondary = true
    await secondaryUserExpertise.save()
  }

  return expertise.save()
}

const setExpertiseSecondary = async (user, expertiseId) => {
  const userExpertises = await user.getUserExpertises()
  const expertise = userExpertises.find(userExpertise => userExpertise.ExpertiseId === expertiseId)
  expertise.isSecondary = true
  const secondaryUserExpertise = userExpertises.find(userExpertise => userExpertise.isSecondary)

  if (secondaryUserExpertise) {
    secondaryUserExpertise.isPrimary = false
    secondaryUserExpertise.isSecondary = true
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
