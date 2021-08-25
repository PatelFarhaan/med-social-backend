const types = require('../types')

module.exports = (sequelize, DataTypes) => {
  const SimplePage = sequelize.define(
    'SimplePage',
    {
      id: types.get('id'),
      pageName: {
        allowNull: false,
        type: DataTypes.STRING
      },
      slug: {
        allowNull: false,
        type: DataTypes.STRING
      },
      effectiveDate: {
        type: DataTypes.DATE
      },
      content: {
        allowNull: false,
        type: DataTypes.TEXT
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    },
    {
      freezeTableName: true
    }
  )

  return SimplePage
}
