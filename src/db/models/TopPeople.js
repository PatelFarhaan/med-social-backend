const types = require('../types')

module.exports = (sequelize, DataTypes) => {
  const TopPeople = sequelize.define(
    'TopPeople',
    {
      id: types.get('id'),
      order: { type: DataTypes.INTEGER, defaultValue: 0 }
    },
    {
      freezeTableName: true
    }
  )

  TopPeople.associate = models => {
    TopPeople.belongsTo(models.User, { onDelete: 'CASCADE' })
    TopPeople.belongsTo(models.Column)
  }

  return TopPeople
}
