const types = require('../types')

module.exports = (sequelize, DataTypes) => {
  const Interest = sequelize.define(
    'Interest',
    {
      id: types.get('id'),
      name: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt')
    },
    {
      freezeTableName: true
    }
  )

  Interest.search = (query, page = 1, limit = 10) => {
    if (sequelize.options.dialect !== 'postgres') {
      console.log('Search is only implemented on POSTGRES database')
      return
    }

    query = query.toLowerCase()
    const offset = limit * (page - 1)

    // eslint-disable-next-line consistent-return
    return sequelize.query(
      `SELECT * FROM "${Interest.tableName}" WHERE LOWER("name") LIKE '%${query}%' LIMIT ${limit} OFFSET ${offset}`,
      Interest
    )
  }

  Interest.associate = models => {
    Interest.belongsToMany(models.Expertise, {
      through: 'Multipotentiality',
      as: 'expertises'
    })

    Interest.belongsToMany(models.User, {
      through: 'UserInterests',
      as: 'users'
    })

    Interest.belongsToMany(models.Column, {
      through: 'ColumnInterests',
      as: 'columns'
    })
  }

  return Interest
}
