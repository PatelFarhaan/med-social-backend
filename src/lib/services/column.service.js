const db = require('../../db/models')
const logger = require('../utils/logger')
const { columnStatuses } = require('../../lib/constants/column.constant')

const LIMIT = 50

const getColumn = async ({ slug }, loaderOpts) => db.Column.findByPk(slug, loaderOpts)

const listColumns = async ({ page = 1, limit = LIMIT, sortBy, sortDirection, includeNonApproved }, loaderOpts) => {
  let order = [['name', 'ASC']]

  const sortFilters = {
    name: direction => [['name', direction.toUpperCase()]],
    createdAt: direction => [['createdAt', direction.toUpperCase()]]
  }

  if (Object.hasOwnProperty.call(sortFilters, sortBy)) {
    order = sortFilters[sortBy](sortDirection)
  }

  let query = {
    where: {
      state: columnStatuses.APPROVED
    }
  }

  if (!includeNonApproved) {
    query = {}
  }

  return db.Column.findAndCountAll({
    query,
    limit,
    offset: limit * (page - 1),
    order,
    ...loaderOpts,
    attributes: ['slug', 'name', 'createdAt']
  })
}

const createColumn = async ({ body: { name, description, interests }, Column = db.Column }) => {
  let column
  try {
    column = await Column.create({ name, description })
    const dbInterests = await db.Interest.findAll({ where: { id: interests } })
    await column.addInterest(dbInterests)
  } catch (e) {
    logger.warn(`createColumn: ${e}`)
    throw e
  }
  return column
}

module.exports = {
  createColumn,
  getColumn,
  listColumns
}
