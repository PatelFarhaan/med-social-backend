const types = require('../types')

module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define(
    'File',
    {
      id: types.get('id'),
      mimeType: { type: DataTypes.STRING, allowNull: false },
      filename: { type: DataTypes.STRING, allowNull: false },
      location: { type: DataTypes.TEXT, allowNull: false },
      success: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt')
    },
    {
      freezeTableName: true
    }
  )

  File.associate = models => {
    File.belongsTo(models.Post)
    File.belongsTo(models.Column)
    File.belongsTo(models.User)
  }

  return File
}
