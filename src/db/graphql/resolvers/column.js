// Resolvers: A map of functions which return data for the schema.
const { columnStatuses } = require('../../../lib/constants/column.constant')
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
    createColumn: can('standard').createResolver(async (_parent, body, { req }) => {
      const column = await columnService.createColumn({ body }, req.user)
      return exportSafeModel(column)
    }),
    subscribeToColumn: can('standard').createResolver(async (_parent, { slug }, { db, req, context, EXPECTED_OPTIONS_KEY }) => {
      const column = await db.Column.findByPk(slug, { [EXPECTED_OPTIONS_KEY]: context })
      if (!column) throw new Error(JSON.stringify({ status: 404, message: 'Column does not exist' }))
      if (column.state !== columnStatuses.APPROVED) throw new Error(JSON.stringify({ status: 400, message: 'Column is still for review' }))
      const subscription = await columnService.subscribeToColumn({ body: { column } }, req.user)
      return exportSafeModel(subscription)
    }),
    unsubscribeToColumn: can('standard').createResolver(async (_parent, { slug }, { db, req, context, EXPECTED_OPTIONS_KEY }) => {
      const column = await db.Column.findByPk(slug, { [EXPECTED_OPTIONS_KEY]: context })
      if (!column) throw new Error(JSON.stringify({ status: 404, message: 'Column does not exist' }))
      return columnService.unsubscribeToColumn({ body: { column } }, req.user)
    }),
    banUser: can('standard').createResolver(async (_parent, { slug, bannedUserId }, { db, req, context, EXPECTED_OPTIONS_KEY }) => {
      const column = await db.Column.findByPk(slug, { [EXPECTED_OPTIONS_KEY]: context })
      if (!column) throw new Error(JSON.stringify({ status: 404, message: 'Column does not exist' }))
      const bannedUser = await db.User.findByPk(bannedUserId, { [EXPECTED_OPTIONS_KEY]: context })
      if (!bannedUser) throw new Error(JSON.stringify({ status: 404, message: 'User does not exist' }))
      return columnService.banUser({ body: { column, bannedUser } }, req.user)
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
    },
    expertise: (column, _args, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const col = db.Column.build(exportSafeModel(column))
      return col.getExpertise({ [EXPECTED_OPTIONS_KEY]: context })
    },
    bannedMembers: (column, { limit = 10, page = 1 }, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const col = db.Column.build(exportSafeModel(column))
      return col.getBannedMembers({ limit, page, [EXPECTED_OPTIONS_KEY]: context })
    }
  }
}
