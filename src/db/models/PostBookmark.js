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

  PostBookmark.associate = models => {
    PostBookmark.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' })
    PostBookmark.belongsTo(models.Post, { foreignKey: 'postId', onDelete: 'CASCADE' })
  }

  return PostBookmark
}
