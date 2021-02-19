const db = require('../../db/models')

const LIMIT = 50

const getInterest = async ({ id }) =>
  db.Interest.findOne({
    where: {
      id
    },
    include: [
      {
        model: db.Expertise,
        as: 'expertises',
        attributes: ['id', 'name'],
        required: false
      }
    ],
    attributes: ['id', 'name', 'createdAt']
  })

const getInterests = async ({ page = 1, limit = LIMIT, sortBy, sortDirection }) => {
  let order = [['name', 'ASC']]

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
    include: [
      {
        model: db.Expertise,
        as: 'expertises',
        attributes: ['id', 'name'],
        required: false
      }
    ],
    attributes: ['id', 'name', 'createdAt']
  })
}

const createInterest = async ({ body: { name }, Interest = db.Interest }) => {
  const interest = await Interest.build({ name })
  // Save
  const savedInterest = await interest.save()

  return savedInterest
}

module.exports = {
  getInterests,
  createInterest,
  getInterest
}
