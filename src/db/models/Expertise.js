const types = require('../types')

module.exports = (sequelize, DataTypes) => {
  const Expertise = sequelize.define(
    'Expertise',
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

  Expertise.associate = models => {
    Expertise.belongsToMany(models.Interest, {
      through: 'Multipotentiality',
      as: 'interests'
    })
  }

  return Expertise
}
