const db = require('../../db/models')

const createDefaultInterest = async () =>
  db.Interest.findOrCreate({
    where: {
      name: 'Test Interest'
    }
  })

const deleteDefaultInterest = async () =>
  db.Interest.destory({
    name: 'Test Interest'
  })

module.exports = {
  createDefaultInterest,
  deleteDefaultInterest
}
