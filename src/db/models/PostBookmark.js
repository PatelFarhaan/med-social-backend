const types = require('../types')

module.exports = (sequelize, _DataTypes) => {
  const PostBookmark = sequelize.define(
    'PostBookmark',
    {
      id: types.get('id'),
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt'),
      deletedAt: types.get('deletedAt')
    },
    {
      freezeTableName: true
    }
  )

  return PostBookmark
}
