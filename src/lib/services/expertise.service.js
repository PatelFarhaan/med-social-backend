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

module.exports = {
  getExpertises,
  createExpertise,
  getExpertise
}
