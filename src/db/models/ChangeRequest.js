const types = require('../types')

module.exports = (sequelize, DataTypes) => {
  const ChangeRequest = sequelize.define(
    'ChangeRequest',
    {
      id: types.get('id'),
      token: { type: DataTypes.STRING },
      expires: DataTypes.DATE,
      table: { type: DataTypes.STRING, allowNull: false },
      attribute: { type: DataTypes.STRING, allowNull: false },
      change: { type: DataTypes.TEXT, allowNull: false },
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt')
    },
    {
      freezeTableName: true
    }
  )

  ChangeRequest.associate = models => {
    ChangeRequest.belongsTo(models.User)
    ChangeRequest.belongsTo(models.User, { as: 'approvedBy' })
  }

  return ChangeRequest
}
