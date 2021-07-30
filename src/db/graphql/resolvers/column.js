// Resolvers: A map of functions which return data for the schema.
const { columnStatuses } = require('../../../lib/constants/column.constant')
const { columnService } = require('../../../lib/services')
const { exportSafeModel } = require('../../../lib/utils/exportSafeModel')
const { can } = require('./../auth')

module.exports = {
  Query: {
    getColumn: async (_parent, { slug }, { db, context, EXPECTED_OPTIONS_KEY }) => {
      const column = await db.Column.findOne({
        where: { slug },
        attributes: [
          'slug',
          'description',
          'name',
          'createdAt',
          'price',
          'visibility',
          'state',
          'type',
          'authorId',
          'ExpertiseId',
          [db.sequelize.literal('(SELECT COUNT(*) FROM "Subscription" WHERE "Subscription"."ColumnSlug" = slug)'), 'MemberCount'],
          [db.sequelize.literal('(SELECT COUNT(*) FROM "Post" WHERE "Post"."ColumnSlug" = slug)'), 'PostCount']
        ],
        [EXPECTED_OPTIONS_KEY]: context
      })
      return exportSafeModel(column)
    },
    listColumns: async (_parent, args, { context, EXPECTED_OPTIONS_KEY }) => {
      const rawColumns = await columnService.listColumns(args, { [EXPECTED_OPTIONS_KEY]: context })
      const columns = rawColumns.rows.map(column => exportSafeModel(column))
      return {
        list: columns,
        count: rawColumns.count
      }
    },
    listPopularColumns: can(['standard', 'admin', 'superadmin']).createResolver(
      async (_parent, args, { context, EXPECTED_OPTIONS_KEY, req }) => {
        const { user } = req
        const rawColumns = await columnService.getPopularColumns(args, user, { [EXPECTED_OPTIONS_KEY]: context })
        const columns = rawColumns.rows.map(column => exportSafeModel(column))
        return {
          list: columns,
          count: rawColumns.count
        }
      }
    ),
    searchColumns: async (_parent, { query, page, limit }, { db }) => {
      const columns = await db.Column.search(query, page, limit)
      return columns[0]
    },
    popularColumnists: async _parent => {
      const columns = await columnService.getPopularcolumnists()
      return columns.map(column => exportSafeModel(column))
    },
    topColumns: async (_parent, args) => {
      const columns = await columnService.getTopColumns(args)
      return columns.map(column => exportSafeModel(column))
    },
    isUserSubscribedToColumn: can(['standard', 'admin', 'superadmin']).createResolver(
      async (_parent, args, { context, EXPECTED_OPTIONS_KEY, req }) => {
        const { user } = req
        return columnService.isUserSubscribedToColumn(args, user, { [EXPECTED_OPTIONS_KEY]: context })
      }
    )
  },
  Mutation: {
    createColumn: can(['standard', 'admin', 'superadmin']).createResolver(async (_parent, body, { req }) => {
      const column = await columnService.createColumn({ body }, req.user)
      return exportSafeModel(column)
    }),
    subscribeToColumn: can(['standard', 'admin', 'superadmin']).createResolver(
      async (_parent, { slug }, { db, req, context, EXPECTED_OPTIONS_KEY }) => {
        const column = await db.Column.findByPk(slug, { [EXPECTED_OPTIONS_KEY]: context })
        if (!column) throw new Error(JSON.stringify({ status: 404, message: 'Column does not exist' }))
        if (column.state !== columnStatuses.APPROVED)
          throw new Error(JSON.stringify({ status: 400, message: 'Column is still for review' }))
        const subscription = await columnService.subscribeToColumn({ body: { column } }, req.user)
        return exportSafeModel(subscription)
      }
    ),
    unsubscribeToColumn: can(['standard', 'admin', 'superadmin']).createResolver(
      async (_parent, { slug }, { db, req, context, EXPECTED_OPTIONS_KEY }) => {
        const column = await db.Column.findByPk(slug, { [EXPECTED_OPTIONS_KEY]: context })
        if (!column) throw new Error(JSON.stringify({ status: 404, message: 'Column does not exist' }))
        return columnService.unsubscribeToColumn({ body: { column } }, req.user)
      }
    ),
    multiColumnUnsubscribe: can(['standard', 'admin', 'superadmin']).createResolver(
      async (_parent, { columns }, { db, req, context, EXPECTED_OPTIONS_KEY }) => {
        const dbColumns = await db.Column.findAll({ where: { slug: columns } }, { [EXPECTED_OPTIONS_KEY]: context })
        if (dbColumns.length === 0) throw new Error(JSON.stringify({ status: 404, message: 'Column does not exist' }))
        return columnService.multiColumnUnsubscribe({ columns: dbColumns }, req.user)
      }
    ),
    banUser: can(['standard', 'admin', 'superadmin']).createResolver(
      async (_parent, { slug, bannedUserId }, { db, req, context, EXPECTED_OPTIONS_KEY }) => {
        const column = await db.Column.findByPk(slug, { [EXPECTED_OPTIONS_KEY]: context })
        if (!column) throw new Error(JSON.stringify({ status: 404, message: 'Column does not exist' }))
        const bannedUser = await db.User.findByPk(bannedUserId, { [EXPECTED_OPTIONS_KEY]: context })
        if (!bannedUser) throw new Error(JSON.stringify({ status: 404, message: 'User does not exist' }))
        return columnService.banUser({ body: { column, bannedUser } }, req.user)
      }
    )
  },
  Column: {
    author: (column, _args, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const col = db.Column.build(exportSafeModel(column))
      return col.getAuthor({ [EXPECTED_OPTIONS_KEY]: context })
    },
    interests: (column, { limit = 10, page = 1 }, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const col = db.Column.build(exportSafeModel(column))
      return col.getInterests({ limit, page, [EXPECTED_OPTIONS_KEY]: context })
    },
    subscriptions: (column, { limit = 10, page = 1 }, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const col = db.Column.build(exportSafeModel(column))
      return col.getSubscriptions({ limit, page, [EXPECTED_OPTIONS_KEY]: context })
    },
    expertise: (column, _args, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const col = db.Column.build(exportSafeModel(column))
      return col.getExpertise({ [EXPECTED_OPTIONS_KEY]: context })
    },
    bannedMembers: (column, { limit = 10, page = 1 }, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const col = db.Column.build(exportSafeModel(column))
      return col.getBannedMembers({ limit, page, [EXPECTED_OPTIONS_KEY]: context })
    },
    topPeople: async (column, { limit = 3, page = 1 }, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const col = db.Column.build(exportSafeModel(column))
      return col.getTopPeople({ limit, page, [EXPECTED_OPTIONS_KEY]: context })
    }
  },
  Subscription: {
    user: (subscription, { limit = 10, page = 1 }, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const sub = db.Subscription.build(exportSafeModel(subscription))
      return sub.getUser({ limit, page, [EXPECTED_OPTIONS_KEY]: context })
    }
  }
}
