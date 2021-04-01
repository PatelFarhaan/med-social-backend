const types = require('../types')

module.exports = (sequelize, DataTypes) => {
  const Expertise = sequelize.define(
    'Expertise',
    {
      id: types.get('id'),
      name: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      isApproved: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt')
    },
    {
      freezeTableName: true
    }
  )

  Expertise.getSearchVector = () => 'ExpertiseName'

  // Use this for Post content
  // Expertise.search = query => {
  //   if (sequelize.options.dialect !== 'postgres') {
  //     console.log('Search is only implemented on POSTGRES database')
  //     return
  //   }

  //   query = sequelize.getQueryInterface().escape(query)
  //   console.warn("query", query)

  //   // eslint-disable-next-line consistent-return
  //   return sequelize.query(
  //     `SELECT * FROM "${Expertise.tableName}" WHERE "${Expertise.getSearchVector()}" @@ plainto_tsquery('english', ${query})`,
  //     Expertise
  //   )
  // }

  Expertise.search = query => {
    if (sequelize.options.dialect !== 'postgres') {
      console.log('Search is only implemented on POSTGRES database')
      return
    }

    query = query.toLowerCase()

    // eslint-disable-next-line consistent-return
    return sequelize.query(`SELECT * FROM "${Expertise.tableName}" WHERE "isApproved"=TRUE AND "name" LIKE '%${query}%'`, Expertise)
  }

  Expertise.associate = models => {
    Expertise.belongsToMany(models.Interest, {
      through: 'Multipotentiality',
      as: 'interests'
    })

    Expertise.belongsToMany(models.Invitation, {
      through: 'InvitationExpertises',
      as: 'invitations'
    })

    Expertise.belongsToMany(models.User, {
      through: models.UserExpertise,
      as: 'users'
    })
  }

  return Expertise
}
