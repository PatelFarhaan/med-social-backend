const types = require('../types')

module.exports = (sequelize, DataTypes) => {
  const Homepage = sequelize.define(
    'Homepage',
    {
      id: types.get('id'),
      taglineMain: {
        type: DataTypes.STRING
      },
      headlineMain: {
        type: DataTypes.STRING
      },
      tag1: {
        type: DataTypes.STRING
      },
      tag2: {
        type: DataTypes.STRING
      },
      tag3: {
        type: DataTypes.STRING
      },
      tag4: {
        type: DataTypes.STRING
      },
      tag5: {
        type: DataTypes.STRING
      },
      tag6: {
        type: DataTypes.STRING
      },
      headline1: {
        type: DataTypes.STRING
      },
      content1: {
        type: DataTypes.TEXT
      },
      headline2: {
        type: DataTypes.STRING
      },
      content2: {
        type: DataTypes.TEXT
      },
      headline3: {
        type: DataTypes.STRING
      },
      content3: {
        type: DataTypes.TEXT
      },
      taglineUnderAsset: {
        type: DataTypes.STRING
      },
      headline4: {
        type: DataTypes.STRING
      },
      content4: {
        type: DataTypes.TEXT
      },
      headline5: {
        type: DataTypes.STRING
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

  return Homepage
}
