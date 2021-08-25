const types = require('../types')

module.exports = (sequelize, DataTypes) => {
  const PaymentMethod = sequelize.define(
    'PaymentMethod',
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      name: { type: DataTypes.STRING },
      brend: { type: DataTypes.STRING },
      brand: { type: DataTypes.STRING },
      expire_year: { type: DataTypes.INTEGER, field: 'expire_year' },
      expire_month: { type: DataTypes.INTEGER, field: 'expire_month' },
      last_digits: { type: DataTypes.STRING, field: 'last_digits' },
      stripe: { type: DataTypes.JSONB },
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt')
    },
    {
      freezeTableName: true
    }
  )

  PaymentMethod.associate = models => {
    PaymentMethod.belongsTo(models.User, { onDelete: 'CASCADE' })
  }

  return PaymentMethod
}
