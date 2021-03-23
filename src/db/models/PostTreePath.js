const types = require('../types')

module.exports = (sequelize, DataTypes) => {
  const PostTreePath = sequelize.define(
    'PostTreePath',
    {
      id: types.get('id'),
      depth: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt')
    },
    {
      freezeTableName: true
    }
  )

  PostTreePath.associate = models => {
    PostTreePath.belongsTo(models.Post, {
      as: 'root'
    })
  }

  return PostTreePath
}
