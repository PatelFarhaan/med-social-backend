const types = require('../types')

module.exports = (sequelize, DataTypes) => {
  const UserExpertise = sequelize.define(
    'UserExpertise',
    {
      id: types.get('id'),
      totalPoints: { type: DataTypes.INTEGER, defaultValue: 0 },
      isPrimary: { type: DataTypes.BOOLEAN },
      isSecondary: { type: DataTypes.BOOLEAN }
    },
    {
      freezeTableName: true
    }
  )

  UserExpertise.associate = models => {
    UserExpertise.belongsTo(models.User, { onDelete: 'CASCADE' })
    UserExpertise.belongsTo(models.Expertise)
  }

  return UserExpertise
}
