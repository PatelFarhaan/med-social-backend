// Resolvers: A map of functions which return data for the schema.
const { subscriptionTypes } = require('../../../lib/constants/subscription.constant')
const { columnService } = require('../../../lib/services')
const { exportSafeModel } = require('../../../lib/utils/exportSafeModel')
const { can } = require('./../auth')

module.exports = {
  Query: {
    getColumn: async (_parent, { slug }, { db, context, EXPECTED_OPTIONS_KEY }) => {
      const column = await db.Column.findByPk(slug, { [EXPECTED_OPTIONS_KEY]: context })
      return exportSafeModel(column)
    },
    listColumns: async (_parent, args, { context, EXPECTED_OPTIONS_KEY }) => {
      const rawColumns = await columnService.listColumns(args, { [EXPECTED_OPTIONS_KEY]: context })
      const columns = rawColumns.rows.map(column => exportSafeModel(column))
      return {
        list: columns,
        count: columns.length
      }
    },
    searchColumns: async (_parent, { query }, { db }) => {
      const columns = await db.Column.search(query)
      return columns[0]
    }
  },
  Mutation: {
    createColumn: async (_parent, body) => {
      const column = await columnService.createColumn({ body })
      return exportSafeModel(column)
    },
    subscribeToColumn: can('standard').createResolver(async (_parent, { slug }, { db, req, context, EXPECTED_OPTIONS_KEY }) => {
      const column = await db.Column.findByPk(slug, { [EXPECTED_OPTIONS_KEY]: context })
      if (!column) throw new Error(JSON.stringify({ status: 404, message: 'Column does not exist' }))
      const { user } = req
      const subscription = await db.Subscription.create({
        type: subscriptionTypes.COLUMN,
        email: user.email
      })
      await subscription.addUser(user)
      await subscription.setColumn(column)
      return exportSafeModel(subscription)
    })
  },
  Column: {
    interests: (column, { limit = 10, page = 1 }, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const col = db.Column.build(exportSafeModel(column))
      return col.getInterests({ limit, page, [EXPECTED_OPTIONS_KEY]: context })
    },
    subscriptions: (column, { limit = 10, page = 1 }, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const col = db.Column.build(exportSafeModel(column))
      return col.getSubscriptions({ include: ['users'], limit, page, [EXPECTED_OPTIONS_KEY]: context })
    }
  }
}
