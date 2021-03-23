const types = require('../types')

module.exports = (sequelize, DataTypes) => {
  const StackedPost = sequelize.define(
    'StackedPost',
    {
      id: types.get('id'),
      order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt')
    },
    {
      freezeTableName: true
    }
  )

  return StackedPost
}
