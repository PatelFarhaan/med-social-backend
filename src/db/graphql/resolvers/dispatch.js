const { dispatchService } = require('../../../lib/services')
const { exportSafeModel } = require('../../../lib/utils/exportSafeModel')
const { can } = require('../auth')

module.exports = {
  Query: {
    getAllDispatches: async (_, { page, limit }) => dispatchService.getAllDispatches(page, limit),
    getDispatch: async (_, { slug }) => {
      const dispatch = await dispatchService.getDispatch(slug)
      return exportSafeModel(dispatch)
    },

    getAllUserDispatches: async (_, { userId, page, limit }) => {
      const dispatches = await dispatchService.getAllUserDispatches(userId, page, limit)
      return exportSafeModel(dispatches)
    }
  },

  Mutation: {
    createDispatch: can(['admin', 'superadmin']).createResolver(async (_, { title, about, content, imageLink }, { req }) => {
      const { user } = req
      const dispatch = await dispatchService.createDispatch(title, about, content, imageLink, user.id)
      return exportSafeModel(dispatch)
    }),

    deleteDispatch: can(['admin', 'superadmin']).createResolver(async (_, { id }, { req }) => dispatchService.deleteDispatch(id, req.user)),

    updateDispatch: can(['admin', 'superadmin']).createResolver(async (_, { title, id, about, content, imageLink }, { req }) => {
      const { user } = req
      const updatedDispatch = dispatchService.updateDispatch(title, id, about, content, imageLink, user.id)
      return exportSafeModel(updatedDispatch)
    })
  },
  Dispatch: {
    dispatchAuthor: (dispatch, _args, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const Dispatch = db.Dispatch.build(exportSafeModel(dispatch))
      return Dispatch.getDispatchAuthor({ [EXPECTED_OPTIONS_KEY]: context })
    }
  }
}
