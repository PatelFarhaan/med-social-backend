const types = require('../types')

module.exports = (sequelize, _DataTypes) => {
  const Follow = sequelize.define(
    'Follow',
    {
      id: types.get('id'),
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt')
    },
    {
      freezeTableName: true
    }
  )

  // Follow.associate = models => {
  //   Follow.belongsTo(models.User, { as: 'Follower', onDelete: 'CASCADE' })
  //   Follow.belongsTo(models.User, { as: 'Following', onDelete: 'CASCADE' })
  // }

  return Follow
}
