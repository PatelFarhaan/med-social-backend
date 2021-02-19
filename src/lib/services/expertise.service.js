const db = require('../../db/models')

const LIMIT = 50

const getExpertise = async ({ id }) =>
  db.Expertise.findOne({
    where: {
      id
    },
    include: [
      {
        model: db.Interest,
        as: 'interests',
        attributes: ['id', 'name'],
        required: false
      }
    ],
    attributes: ['id', 'name', 'createdAt']
  })

const getExpertises = async ({ page = 1, limit = LIMIT, sortBy, sortDirection }) => {
  let order = [['name', 'ASC']]

  const sortFilters = {
    name: direction => [['name', direction.toUpperCase()]],
    createdAt: direction => [['createdAt', direction.toUpperCase()]]
  }

  if (Object.hasOwnProperty.call(sortFilters, sortBy)) {
    order = sortFilters[sortBy](sortDirection)
  }

  return db.Expertise.findAndCountAll({
    limit,
    offset: limit * (page - 1),
    order,
    include: [
      {
        model: db.Interest,
        as: 'interests',
        attributes: ['id', 'name'],
        required: false
      }
    ],
    attributes: ['id', 'name', 'createdAt']
  })
}

const createExpertise = async ({ body: { name, interests }, Expertise = db.Expertise }) => {
  const expertise = await Expertise.create({ name })
  const dbInterests = await db.Interest.findAll({ where: { id: interests } })
  await expertise.addInterest(dbInterests)
  return expertise
}

module.exports = {
  getExpertises,
  createExpertise,
  getExpertise
}
