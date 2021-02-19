const types = require('../types')

module.exports = (sequelize, DataTypes) => {
  const Interest = sequelize.define(
    'Interest',
    {
      id: types.get('id'),
      name: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt')
    },
    {
      freezeTableName: true
    }
  )

  Interest.associate = models => {
    Interest.belongsToMany(models.Expertise, {
      through: 'Multipotentiality',
      as: 'expertises'
    })
  }

  return Interest
}
