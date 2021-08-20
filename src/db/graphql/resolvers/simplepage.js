const { simplepageService } = require('../../../lib/services')
const { can } = require('../auth')

module.exports = {
  Query: {
    getAllSimplepages: async () => simplepageService.getAllSimplepages(),
    getSimplepage: async (_, { id }) => simplepageService.getSimplepage(id)
  },

  Mutation: {
    createSimplepage: can(['admin', 'superadmin']).createResolver(async (_, { pageName, effectiveDate, content }) =>
      simplepageService.createSimplepage(pageName, effectiveDate, content)
    ),
    updateSimplepage: can(['admin', 'superadmin']).createResolver(async (_, { pageName, id, effectiveDate, content }) =>
      simplepageService.updateSimplepage(pageName, id, effectiveDate, content)
    )
  }
}
