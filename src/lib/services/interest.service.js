const { EXPECTED_OPTIONS_KEY } = require('dataloader-sequelize')
const db = require('../../db/models')
const logger = require('../utils/logger')

const LIMIT = 50

const getInterest = async ({ id, context }) => db.Interest.findByPk(id, { [EXPECTED_OPTIONS_KEY]: context })

const getInterests = async ({ page = 1, limit = LIMIT, sortBy, sortDirection }, loaderOpts) => {
  let order = [['name', 'ASC']]

  console.log(loaderOpts)

  const sortFilters = {
    name: direction => [['name', direction.toUpperCase()]],
    createdAt: direction => [['createdAt', direction.toUpperCase()]]
  }

  if (Object.hasOwnProperty.call(sortFilters, sortBy)) {
    order = sortFilters[sortBy](sortDirection)
  }

  return db.Interest.findAndCountAll({
    limit,
    offset: limit * (page - 1),
    order,
    ...loaderOpts,
    attributes: ['id', 'name', 'createdAt']
  })
}

const createInterest = async ({ body: { name }, Interest = db.Interest }) => {
  const interest = await Interest.build({ name })
  let savedInterest
  try {
    savedInterest = await interest.save()
  } catch (e) {
    logger.warn(`createInterest ${e}`)
    throw e
  }

  return savedInterest
}

module.exports = {
  getInterests,
  createInterest,
  getInterest
}
