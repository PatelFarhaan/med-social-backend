const types = require('../types')
const { queueStatuses } = require('../../lib/constants/pseudoPostQueue.constant')

module.exports = (sequelize, DataTypes) => {
  const PseudoPostQueue = sequelize.define(
    'PseudoPostQueue',
    {
      id: types.get('id'),
      state: { type: DataTypes.ENUM(Object.keys(queueStatuses)), defaultValue: queueStatuses.PENDING },
      conversationId: { type: DataTypes.STRING, allowNull: false },
      ColumnSlug: { type: DataTypes.STRING, allowNull: false },
      username: { type: DataTypes.STRING, allowNull: false },
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt')
    },
    {
      freezeTableName: true
    }
  )

  return PseudoPostQueue
}
