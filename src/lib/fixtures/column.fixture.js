const db = require('../../db/models')
const { columnStatuses } = require('../constants/column.constant')

const createDefaultColumn = async () =>
  db.Column.findOrCreate({
    where: {
      name: 'Test Column',
      description: 'This is a test column',
      state: columnStatuses.APPROVED
    }
  })

const deleteDefaultColumn = async () =>
  db.Column.destroy({
    slug: 'test-column'
  })

module.exports = {
  createDefaultColumn,
  deleteDefaultColumn
}
