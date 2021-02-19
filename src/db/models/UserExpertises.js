module.exports = (sequelize, DataTypes) => {
  const UserExpertises = sequelize.define(
    'UserExpertises',
    {
      totalPoints: { type: DataTypes.INTEGER, defaultValue: 0 },
      isPrimary: { type: DataTypes.BOOLEAN },
      isSecondary: { type: DataTypes.BOOLEAN }
    },
    {
      freezeTableName: true
    }
  )

  return UserExpertises
}
