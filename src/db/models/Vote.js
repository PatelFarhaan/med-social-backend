const types = require('../types')
const { voteTypes } = require('../../lib/constants/vote.constant')

module.exports = (sequelize, DataTypes) => {
  const Vote = sequelize.define(
    'Vote',
    {
      id: types.get('id'),
      type: { type: DataTypes.ENUM(Object.keys(voteTypes)), allowNull: false, defaultValue: voteTypes.UP },
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt')
    },
    {
      freezeTableName: true
    }
  )

  return Vote
}
