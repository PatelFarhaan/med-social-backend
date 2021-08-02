const { tokenTypes } = require('../../lib/constants/token.constant')

module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define(
    'Session',
    {
      token: { type: DataTypes.STRING, primaryKey: true },
      expires: DataTypes.DATE,
      type: { type: DataTypes.ENUM(Object.values(tokenTypes)) },
      blackListed: { type: DataTypes.BOOLEAN }
    },
    {
      freezeTableName: true
    }
  )

  Session.associate = models => {
    Session.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    })
  }

  return Session
}
