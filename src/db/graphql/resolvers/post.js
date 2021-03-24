// Resolvers: A map of functions which return data for the schema.
const { postService } = require('../../../lib/services')
const { exportSafeModel } = require('../../../lib/utils/exportSafeModel')
const { can } = require('./../auth')

module.exports = {
  Query: {
    getPost: async (_parent, { id }, { db, context, EXPECTED_OPTIONS_KEY }) => {
      const post = await db.Post.findByPk(id, { [EXPECTED_OPTIONS_KEY]: context })
      return exportSafeModel(post)
    },
    listPosts: async (_parent, args, { context, EXPECTED_OPTIONS_KEY }) => {
      const rawPosts = await postService.listPosts(args, { [EXPECTED_OPTIONS_KEY]: context })
      const posts = rawPosts.rows.map(post => exportSafeModel(post))
      return {
        list: posts,
        count: posts.length
      }
    },
    searchPosts: async (_parent, { query }, { db }) => {
      const columns = await db.Post.search(query)
      return columns[0]
    }
  },
  Mutation: {
    createPost: can('standard').createResolver(async (_parent, body, { req }) => {
      const post = await postService.createPost({ body }, req.user)
      return exportSafeModel(post)
    }),
    createPostBookmark: can('standard').createResolver(async (_parent, body, { req }) => {
      const post = await postService.bookmarkPost({ body }, req.user)
      return exportSafeModel(post)
    }),
    createPostVote: can('standard').createResolver(async (_parent, body, { req }) => {
      const post = await postService.votePost({ body }, req.user)
      return exportSafeModel(post)
    })
  },
  Post: {
    author: (post, _args, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const dbPost = db.Post.build(exportSafeModel(post))
      return dbPost.getAuthor({ [EXPECTED_OPTIONS_KEY]: context })
    },
    stackedPosts: (post, { limit = 10, page = 1 }, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const dbPost = db.Post.build(exportSafeModel(post))
      return dbPost.getStackedChildren({ limit, page, [EXPECTED_OPTIONS_KEY]: context })
    }
  }
}
