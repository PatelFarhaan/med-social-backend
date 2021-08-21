const types = require('../types')

module.exports = (sequelize, DataTypes) => {
  const News = sequelize.define(
    'News',
    {
      id: types.get('id'),
      headline: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false
      },
      publisher: {
        type: DataTypes.STRING,
        allowNull: false
      },
      link: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      freezeTableName: true
    }
  )

  News.associate = models => {
    News.belongsTo(models.User, {
      as: 'newsAuthor',
      foreignKey: 'UserId',
      onDelete: 'CASCADE'
    })
  }

  return News
}
