const types = require('../types')
const { notificationCategories, notificationTypes } = require('../../lib/constants/notification.constant')

module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    'Notification',
    {
      id: types.get('id'),
      data: { type: DataTypes.JSONB, allowNull: false },
      category: { type: DataTypes.ENUM(Object.keys(notificationCategories)), allowNull: false },
      type: { type: DataTypes.ENUM(Object.keys(notificationTypes)), allowNull: false },
      createdAt: types.get('createdAt')
    },
    {
      freezeTableName: true
    }
  )

  Notification.associate = models => {
    Notification.belongsTo(models.User, {
      as: 'author'
    })

    Notification.belongsToMany(models.User, {
      through: 'NotificationReceipient',
      as: 'receipients'
    })
  }

  return Notification
}
