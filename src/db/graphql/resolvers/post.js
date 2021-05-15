// Resolvers: A map of functions which return data for the schema.
const { postService } = require('../../../lib/services')
const { exportSafeModel } = require('../../../lib/utils/exportSafeModel')
const { can } = require('./../auth')
const { postPublicFields } = require('../../../lib/constants/post.constant')

module.exports = {
  Query: {
    getPost: async (_parent, args, { req, context, EXPECTED_OPTIONS_KEY }) => {
      const post = await await postService.getPost(args, req.user, { [EXPECTED_OPTIONS_KEY]: context })
      return exportSafeModel(post)
    },
    listColumnPosts: async (_parent, args, { req, context, EXPECTED_OPTIONS_KEY }) => {
      const rawPosts = await postService.listColumnPosts(args, req.user, { [EXPECTED_OPTIONS_KEY]: context })
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
    listUserAuthoredPosts: async (_parent, args, { req, context, EXPECTED_OPTIONS_KEY }) => {
      const rawPosts = await postService.listUserAuthoredPosts(args, req.user, { [EXPECTED_OPTIONS_KEY]: context })
      const posts = rawPosts.rows.map(post => exportSafeModel(post))
      return {
        list: posts,
        count: rawPosts.count
      }
    },
    listUserBookmarks: async (_parent, args, { req, context, EXPECTED_OPTIONS_KEY }) => {
      const rawPosts = await postService.listUserBookmarks(args, req.user, { [EXPECTED_OPTIONS_KEY]: context })
      const posts = rawPosts.rows.map(post => exportSafeModel(post))
      return {
        list: posts,
        count: rawPosts.count
      }
    },
    searchPosts: async (_parent, { query, page, limit }, { db }) => {
      const posts = await db.Post.search(query, page, limit)
      return posts[0]
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
    column: async (post, _args, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const dbPost = db.Post.build(exportSafeModel(post))
      return dbPost.getColumn({ [EXPECTED_OPTIONS_KEY]: context })
    },
    stackParent: async (post, _args, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const dbPost = db.Post.build(exportSafeModel(post))
      return dbPost.getStackParent({ [EXPECTED_OPTIONS_KEY]: context })
    },
    author: async (post, _args, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const dbPost = db.Post.build(exportSafeModel(post))
      return dbPost.getAuthor({ [EXPECTED_OPTIONS_KEY]: context })
    },
    children: async (post, _args) => JSON.stringify(post.children),
    stackedPosts: async (post, { limit = 10, page = 1, hierarchy = false }, { req, db, EXPECTED_OPTIONS_KEY, context }) => {
      const dbPost = db.Post.build(exportSafeModel(post))
      const { user } = req

      const attributes = postPublicFields
      if (user) {
        attributes.push(
          [
            db.sequelize.literal(
              `(SELECT type FROM "Vote" AS votes WHERE "votes"."PostId" = "Post"."id" AND "votes"."UserId" = '${user.id}')`
            ),
            'userVote'
          ],
          [
            db.sequelize.literal(
              `(SELECT COUNT(*) FROM "PostBookmark" AS bookmarks WHERE "bookmarks"."postId" = "Post"."id" AND "bookmarks"."userId" = '${
                user.id
              }')`
            ),
            'userBookmark'
          ]
        )
      }

      const includeChildren = hierarchy
        ? [
            'stackedChildren',
            {
              model: db.Post,
              as: 'descendents',
              attributes,
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
        attributes,
        limit,
        page,
        [EXPECTED_OPTIONS_KEY]: context
      })

      return children.map(c => ({ ...exportSafeModel(c), order: c.StackedPost ? c.StackedPost.order : null }))
    },
    files: async (post, _args, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const dbPost = db.Post.build(exportSafeModel(post))
      return dbPost.getFiles({ [EXPECTED_OPTIONS_KEY]: context })
    },
    quotedPost: async (post, _args, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const dbPost = db.Post.build(exportSafeModel(post))
      return dbPost.getQuotedPost({ [EXPECTED_OPTIONS_KEY]: context })
    },
    parent: async (post, _args, { db, EXPECTED_OPTIONS_KEY, context }) => {
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
