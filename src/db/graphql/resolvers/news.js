const { newsService } = require('../../../lib/services')
const { exportSafeModel } = require('../../../lib/utils/exportSafeModel')
const { can } = require('../auth')

// const LIMIT = 10

module.exports = {
  Query: {
    getAllNews: async (_, { page, limit }) => newsService.getAllNews(page, limit),

    getNews: async (_, { slug }) => {
      const cmsNew = await newsService.getNews(slug)
      return exportSafeModel(cmsNew)
    },

    getAllUserNews: async (_, { userId, page, limit }) => {
      const news = await newsService.getAllUserNews(userId, page, limit)
      return exportSafeModel(news)
    }
  },

  Mutation: {
    createNews: can(['admin', 'superadmin']).createResolver(async (_, { headline, publisher, link }, { req }) => {
      const { user } = req
      const cmsNew = await newsService.createNews(headline, publisher, link, user.id)
      return exportSafeModel(cmsNew)
    }),

    deleteNews: can(['admin', 'superadmin']).createResolver(async (_, { id }, { req }) => newsService.deleteNews(id, req.user)),

    updateNews: can(['admin', 'superadmin']).createResolver(async (_, { headline, id, publisher, link }, { req }) => {
      const { user } = req
      const updatedNew = await newsService.updateNews(headline, id, publisher, link, user.id)
      return exportSafeModel(updatedNew)
    })
  },
  News: {
    newsAuthor: (news, _args, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const News = db.News.build(exportSafeModel(news))
      return News.getNewsAuthor({ [EXPECTED_OPTIONS_KEY]: context })
    }
  }
}
