const types = require('../types')

module.exports = (sequelize, DataTypes) => {
  const PseudoUser = sequelize.define(
    'PseudoUser',
    {
      username: { type: DataTypes.STRING(255), primaryKey: true, allowNull: false },
      id: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING(255) },
      bio: { type: DataTypes.TEXT },
      location: { type: DataTypes.TEXT },
      url: { type: DataTypes.TEXT },
      joinDate: { type: DataTypes.STRING(255), field: 'join_date' },
      joinTime: { type: DataTypes.STRING(255), field: 'join_time' },
      tweets: { type: DataTypes.INTEGER, allowNull: false },
      following: { type: DataTypes.INTEGER, allowNull: false },
      followers: { type: DataTypes.INTEGER, allowNull: false },
      likes: { type: DataTypes.INTEGER },
      media: { type: DataTypes.INTEGER },
      private: { type: DataTypes.BOOLEAN, allowNull: false },
      verified: { type: DataTypes.BOOLEAN, allowNull: false },
      profileImageUrl: { type: DataTypes.TEXT, field: 'profile_image_url' },
      backgroundImage: { type: DataTypes.TEXT, field: 'background_image' },
      active: { type: DataTypes.BOOLEAN, allowNull: true },
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt'),
      deactivatedAt: types.get('deactivatedAt')
    },
    {
      freezeTableName: true
    }
  )
  return PseudoUser
}
