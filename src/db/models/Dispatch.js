const types = require('../types')

module.exports = (sequelize, DataTypes) => {
  const Dispatch = sequelize.define(
    'Dispatch',
    {
      id: types.get('id'),
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false
      },
      about: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      imageLink: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      freezeTableName: true
    }
  )

  Dispatch.associate = models => {
    Dispatch.belongsTo(models.User, { as: 'dispatchAuthor', foreignKey: 'UserId', onDelete: 'CASCADE' })
  }

  return Dispatch
}
