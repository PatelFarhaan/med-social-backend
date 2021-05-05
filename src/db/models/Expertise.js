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

  Expertise.search = (query, page = 1, limit = 10) => {
    if (sequelize.options.dialect !== 'postgres') {
      console.log('Search is only implemented on POSTGRES database')
      return
    }

    query = query.toLowerCase()
    const offset = limit * (page - 1)
    // eslint-disable-next-line consistent-return
    return sequelize.query(
      `SELECT * FROM "${Expertise.tableName}" WHERE "isApproved"=TRUE AND LOWER("name") LIKE '%${query}%' LIMIT ${limit} OFFSET ${offset}`,
      Expertise
    )
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

    // Expertise.hasMany(models.UserExpertise)
  }

  return Expertise
}
