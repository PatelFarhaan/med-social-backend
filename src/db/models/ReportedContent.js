const types = require('../types')
const { reportedContentStatuses } = require('../../lib/constants/reportedContent.constant')

module.exports = (sequelize, DataTypes) => {
  const ReportedContent = sequelize.define(
    'ReportedContent',
    {
      id: types.get('id'),
      reason: { type: DataTypes.TEXT, allowNull: false },
      state: {
        type: DataTypes.ENUM(Object.keys(reportedContentStatuses)),
        allowNull: false,
        defaultValue: reportedContentStatuses.PENDING
      },
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt')
    },
    {
      freezeTableName: true
    }
  )

  ReportedContent.associate = models => {
    ReportedContent.belongsTo(models.Post)
    ReportedContent.belongsTo(models.Column)
    ReportedContent.belongsTo(models.User, { as: 'reporter', onDelete: 'CASCADE' })
    ReportedContent.belongsTo(models.User, { as: 'approvedBy', onDelete: 'CASCADE' })
  }

  return ReportedContent
}
