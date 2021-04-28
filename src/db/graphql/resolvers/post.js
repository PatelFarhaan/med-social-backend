// Resolvers: A map of functions which return data for the schema.
const { postService } = require('../../../lib/services')
const { exportSafeModel } = require('../../../lib/utils/exportSafeModel')
const { can } = require('./../auth')

module.exports = {
  Query: {
    getPost: async (_parent, args, { context, EXPECTED_OPTIONS_KEY }) => {
      const post = await await postService.getPost(args, { [EXPECTED_OPTIONS_KEY]: context })
      return exportSafeModel(post)
    },
    listColumnPosts: async (_parent, args, { context, EXPECTED_OPTIONS_KEY }) => {
      const rawPosts = await postService.listColumnPosts(args, { [EXPECTED_OPTIONS_KEY]: context })
      const posts = rawPosts.rows.map(post => exportSafeModel(post))
      return {
        list: posts,
        count: rawPosts.count
      }
    },
    listUserPosts: can(['standard', 'admin', 'superadmin']).createResolver(
      async (_parent, args, { req, context, EXPECTED_OPTIONS_KEY }) => {
        const { user } = req
        const rawPosts = await postService.listUserPosts(args, user, { [EXPECTED_OPTIONS_KEY]: context })
        const posts = rawPosts.rows.map(post => exportSafeModel(post))
        return {
          list: posts,
          count: rawPosts.count
        }
      }
    ),
    listUserAuthoredPosts: can(['standard', 'admin', 'superadmin']).createResolver(
      async (_parent, args, { req, context, EXPECTED_OPTIONS_KEY }) => {
        const { user } = req
        const rawPosts = await postService.listUserAuthoredPosts(args, user, { [EXPECTED_OPTIONS_KEY]: context })
        const posts = rawPosts.rows.map(post => exportSafeModel(post))
        return {
          list: posts,
          count: rawPosts.count
        }
      }
    ),
    listUserBookmarks: can(['standard', 'admin', 'superadmin']).createResolver(
      async (_parent, args, { req, context, EXPECTED_OPTIONS_KEY }) => {
        const { user } = req
        const rawPosts = await postService.listUserBookmarks(args, user, { [EXPECTED_OPTIONS_KEY]: context })
        const posts = rawPosts.rows.map(post => exportSafeModel(post))
        return {
          list: posts,
          count: rawPosts.count
        }
      }
    ),
    searchPosts: async (_parent, { query }, { db }) => {
      const columns = await db.Post.search(query)
      return columns[0]
    }
  },
  Mutation: {
    createPost: can(['standard', 'admin', 'superadmin']).createResolver(async (_parent, body, { req }) => {
      const post = await postService.createPost({ body }, req.user)
      return exportSafeModel(post)
    }),
    editPost: can(['standard', 'admin', 'superadmin']).createResolver(async (_parent, body, { req }) => {
      const post = await postService.editPost({ body }, req.user)
      return exportSafeModel(post)
    }),
    createComment: can(['standard', 'admin', 'superadmin']).createResolver(async (_parent, body, { req }) => {
      const comment = await postService.createComment({ body }, req.user)
      return exportSafeModel(comment)
    }),
    createPostBookmark: can(['standard', 'admin', 'superadmin']).createResolver(async (_parent, body, { req }) => {
      const post = await postService.bookmarkPost({ body }, req.user)
      return exportSafeModel(post)
    }),
    createPostVote: can(['standard', 'admin', 'superadmin']).createResolver(async (_parent, body, { req }) => {
      const post = await postService.votePost({ body }, req.user)
      return exportSafeModel(post)
    }),
    deletePost: can(['standard', 'admin', 'superadmin']).createResolver(async (_parent, body, { req }) =>
      postService.deletePost({ body }, req.user)
    ),
    reportPost: can(['standard', 'admin', 'superadmin']).createResolver(async (_parent, body, { req }) =>
      postService.reportPost({ body }, req.user)
    ),
    reviewPost: can(['admin', 'superadmin']).createResolver(async (_parent, body, { req }) =>
      postService.reviewReportedPost({ body }, req.user)
    ),
    uploadFileToPost: can(['admin', 'superadmin']).createResolver(async (_parent, body, { req }) =>
      postService.uploadFileToPost({ body }, req.user)
    )
  },
  Post: {
    column: (post, _args, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const dbPost = db.Post.build(exportSafeModel(post))
      return dbPost.getColumn({ [EXPECTED_OPTIONS_KEY]: context })
    },
    author: (post, _args, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const dbPost = db.Post.build(exportSafeModel(post))
      return dbPost.getAuthor({ [EXPECTED_OPTIONS_KEY]: context })
    },
    children: (post, _args) => JSON.stringify(post.children),
    stackedPosts: async (post, { limit = 10, page = 1, hierarchy = false }, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const dbPost = db.Post.build(exportSafeModel(post))
      const includeChildren = hierarchy
        ? [
            'stackedChildren',
            {
              model: db.Post,
              as: 'descendents',
              hierarchy,
              include: {
                model: db.User,
                as: 'author',
                attributes: ['id', 'firstName', 'lastName', 'fullName', 'profilePicture'],
                include: {
                  model: db.Expertise,
                  as: 'expertises',
                  through: { attributes: [] }
                }
              }
            }
          ]
        : ['stackedChildren']
      const children = await dbPost.getStackedChildren({
        include: includeChildren,
        limit,
        page,
        [EXPECTED_OPTIONS_KEY]: context
      })

      return children.map(c => ({ ...exportSafeModel(c), order: c.StackedPost ? c.StackedPost.order : null }))
    },
    files: (post, _args, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const dbPost = db.Post.build(exportSafeModel(post))
      return dbPost.getFiles({ [EXPECTED_OPTIONS_KEY]: context })
    },
    quotedPost: (post, _args, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const dbPost = db.Post.build(exportSafeModel(post))
      return dbPost.getQuotedPost({ [EXPECTED_OPTIONS_KEY]: context })
    },
    parent: (post, _args, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const dbPost = db.Post.build(exportSafeModel(post))
      return dbPost.getParent({ [EXPECTED_OPTIONS_KEY]: context })
    }
  },
  File: {
    post: (file, _args, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const dbFile = db.File.build(exportSafeModel(file))
      return dbFile.getPost({ [EXPECTED_OPTIONS_KEY]: context })
    },
    column: (file, _args, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const dbFile = db.File.build(exportSafeModel(file))
      return dbFile.getColumn({ [EXPECTED_OPTIONS_KEY]: context })
    },
    user: (file, _args, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const dbFile = db.File.build(exportSafeModel(file))
      return dbFile.getUser({ [EXPECTED_OPTIONS_KEY]: context })
    }
  }
}
