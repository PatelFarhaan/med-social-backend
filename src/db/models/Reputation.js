const types = require('../types')
const { reputationSources } = require('../../lib/constants/reputation.constant')

module.exports = (sequelize, DataTypes) => {
  const Reputation = sequelize.define(
    'Reputation',
    {
      id: types.get('id'),
      source: { type: DataTypes.ENUM(Object.keys(reputationSources)) },
      value: { type: DataTypes.DECIMAL(8, 2) },
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt')
    },
    {
      freezeTableName: true
    }
  )

  Reputation.associate = models => {
    Reputation.belongsTo(models.Post, { constraints: false })
    Reputation.belongsTo(models.UserExpertise)
    Reputation.belongsTo(models.Column)
    Reputation.belongsTo(models.User, { as: 'author' })
  }

  return Reputation
}
