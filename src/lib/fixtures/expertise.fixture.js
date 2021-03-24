const db = require('../../db/models')

const createDefaultExpertise = async () =>
  db.Expertise.findOrCreate({
    where: {
      name: 'Test Expertise'
    }
  })

const deleteDefaultExpertise = async () =>
  db.Expertise.destroy({
    name: 'Test Expertise'
  })

module.exports = {
  createDefaultExpertise,
  deleteDefaultExpertise
}
