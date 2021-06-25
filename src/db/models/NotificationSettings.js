const types = require('../types')

module.exports = (sequelize, DataTypes) => {
  const NotificationSettings = sequelize.define(
    'NotificationSettings',
    {
      id: types.get('id'),
      pushNotifications: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      upVote: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      downVote: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      repliesAndQuotes: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      bookmarks: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      columns: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      invitations: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      yourReputation: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      reminders: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      admin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt')
    },
    {
      freezeTableName: true
    }
  )

  NotificationSettings.associate = models => {
    NotificationSettings.belongsTo(models.User)
  }

  return NotificationSettings
}
