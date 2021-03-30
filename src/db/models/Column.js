const slugify = require('slugify')
const types = require('../types')
const { columnVisibilities, columnStatuses, columnTypes } = require('../../lib/constants/column.constant')

module.exports = (sequelize, DataTypes) => {
  const Column = sequelize.define(
    'Column',
    {
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt'),
      name: { type: DataTypes.STRING(42), allowNull: false, unique: true },
      description: { type: DataTypes.STRING(280), allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
      price: { type: DataTypes.DECIMAL(10, 2) },
      visibility: { type: DataTypes.ENUM(Object.keys(columnVisibilities)), defaultValue: columnVisibilities.PUBLIC },
      state: { type: DataTypes.ENUM(Object.keys(columnStatuses)), defaultValue: columnStatuses.PENDING },
      type: { type: DataTypes.ENUM(Object.keys(columnTypes)), defaultValue: columnTypes.FREE },
      stripePriceId: { type: DataTypes.STRING(150), field: 'stripe_price_id' }
    },
    {
      freezeTableName: true
    }
  )

  Column.search = query => {
    if (sequelize.options.dialect !== 'postgres') {
      console.log('Search is only implemented on POSTGRES database')
      return
    }

    query = query.toLowerCase()

    // eslint-disable-next-line consistent-return
    return sequelize.query(`SELECT * FROM "${Column.tableName}" WHERE "state"="APPROVED" AND "name" LIKE '%${query}%'`, Column)
  }

  Column.associate = models => {
    Column.belongsToMany(models.User, {
      through: 'BannedColumnMembers',
      as: 'bannedMembers'
    })

    Column.belongsTo(models.User, {
      as: 'author'
    })

    Column.belongsToMany(models.Interest, {
      through: 'ColumnInterests',
      as: 'interests'
    })

    Column.belongsTo(models.Expertise)

    Column.hasMany(models.Subscription, {
      as: 'subscriptions'
    })

    Column.belongsToMany(models.Post, {
      through: 'ColumnPosts',
      as: 'posts'
    })

    Column.hasMany(models.ReportedContent)
  }

  /* eslint-disable no-param-reassign */
  Column.addHook('beforeValidate', instance => {
    instance.slug = slugify(instance.name, { lower: true })
  })

  return Column
}
