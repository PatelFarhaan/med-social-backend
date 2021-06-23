const types = require('../types')

module.exports = (sequelize, DataTypes) => {
  const NotificationSettings = sequelize.define(
    'NotificationSettings',
    {
      id: types.get('id'),
      pushNotifications: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      upVote: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      downVote: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      repliesAndQuotes: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      bookmarks: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      columns: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      invitations: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      yourReputation: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      reminders: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      admin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
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
