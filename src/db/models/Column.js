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
      stripePriceId: { type: DataTypes.STRING(150), field: 'stripe_price_id' },
      stripeTaxPriceId: { type: DataTypes.STRING(150), field: 'stripe_tax_price_id' }
    },
    {
      freezeTableName: true
    }
  )

  Column.search = (query, page = 1, limit = 10) => {
    if (sequelize.options.dialect !== 'postgres') {
      console.log('Search is only implemented on POSTGRES database')
      return
    }

    query = query.toLowerCase()
    const offset = limit * (page - 1)
    // eslint-disable-next-line consistent-return
    return sequelize.query(
      // eslint-disable-next-line max-len
      `SELECT "Column".*, (SELECT COUNT(*) FROM "Subscription" WHERE "Subscription"."ColumnSlug" = "Column"."slug") AS "MemberCount", (SELECT COUNT(*) FROM "Post" WHERE "Post"."ColumnSlug" = "Column"."slug") AS "PostCount" FROM "Column" WHERE "state" = 'APPROVED' AND LOWER("name") LIKE '%${query}%' LIMIT ${limit} OFFSET ${offset}`,
      Column
    )
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

    Column.hasMany(models.Post)

    Column.hasMany(models.ReportedContent)
  }

  /* eslint-disable no-param-reassign */
  Column.addHook('beforeValidate', instance => {
    instance.slug = slugify(instance.name, { lower: true })
  })

  return Column
}
