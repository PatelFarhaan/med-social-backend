const db = require('../../db/models')
const logger = require('../utils/logger')
const uploadService = require('./upload.service')

const LIMIT = 50

const getPost = async ({ slug }, loaderOpts) => db.Post.findByPk(slug, loaderOpts)

const listPosts = async ({ page = 1, limit = LIMIT, sortBy, sortDirection, _column }, loaderOpts) => {
  let order = [['createdAt', 'ASC']]

  const sortFilters = {
    votes: direction => [['votes', direction.toUpperCase()]],
    createdAt: direction => [['createdAt', direction.toUpperCase()]]
  }

  if (Object.hasOwnProperty.call(sortFilters, sortBy)) {
    order = sortFilters[sortBy](sortDirection)
  }

  return db.Post.findAndCountAll({
    where: {
      isStacked: false
    },
    // include: {
    //   model: db.Post,
    //   as: 'stackedChildren'
    // },
    // include: {
    //   model: db.Column,
    //   as: 'column',
    //   where: {
    //     slug: {
    //       $eq: column
    //     }
    //   }
    // },
    limit,
    offset: limit * (page - 1),
    order,
    ...loaderOpts
  })
}

const createPost = async ({ body: { column, stackedPosts = [], files = [], ...postFields } }, user, Post = db.Post, Column = db.Column) => {
  let post
  try {
    post = await Post.create(postFields)
    await post.setAuthor(user)
    const existingColumn = await Column.findByPk(column)
    if (!existingColumn) throw new Error(JSON.stringify({ status: 404, message: 'Column not found' }))
    await post.setColumn(column)
    if (stackedPosts.length > 0) {
      await Promise.all(
        stackedPosts.map(async (stackedPost, index) =>
          post.createStackedChild({ content: stackedPost.content, isStacked: true }, { through: { order: index } })
        )
      )
    }
    if (files.length > 0) {
      const uploadedFiles = (await Promise.all(files)).map(uploadService.processUploadS3)
      const savedFiles = (await Promise.all(uploadedFiles)).map(async file => post.createFile(file))
      // eslint-disable-next-line no-unused-vars
      const saveAssociations = (await Promise.all(savedFiles)).map(async file => {
        await file.setUser(user)
        await file.setColumn(column)
      })
    }
  } catch (e) {
    logger.warn(`createPost: ${e}`)
    throw new Error(JSON.stringify({ status: 400, message: e }))
  }
  return post
}

const updateVoteValue = async (voteType, post) => {
  if (voteType === 'UP') {
    await post.increment('votes', { by: 1 })
  } else {
    await post.decrement('votes', { by: 1 })
  }
}

const votePost = async ({ body: { id, type } }, user, Post = db.Post, Vote = db.Vote) => {
  let post
  try {
    post = await Post.findByPk(id)
    if (!post) throw new Error(JSON.stringify({ status: 404, message: 'Post not found' }))
    const existingVote = await Vote.findOne({ where: { postId: post.id, userId: user.id } })
    if (existingVote) {
      if (existingVote.type === type) {
        await existingVote.destroy()
      } else {
        existingVote.type = type
        await existingVote.save()
        await updateVoteValue(type, post)
      }
    } else {
      await post.addUserVote(user, { through: { type } })
      await updateVoteValue(type, post)
    }
  } catch (e) {
    logger.warn(`votePost: ${e}`)
    throw new Error(JSON.stringify({ status: 400, message: e }))
  }
  return post
}

const bookmarkPost = async ({ body: { id } }, user, Post = db.Post, PostBookmark = db.PostBookmark) => {
  let post
  try {
    post = await Post.findByPk(id)
    if (!post) throw new Error(JSON.stringify({ status: 404, message: 'Post not found' }))
    const existingBookmark = await PostBookmark.findOne({ where: { postId: post.id, userId: user.id } })
    if (existingBookmark) {
      await existingBookmark.destroy()
    } else {
      await post.addUserBookmark(user)
    }
  } catch (e) {
    logger.warn(`votePost: ${e}`)
    throw new Error(JSON.stringify({ status: 400, message: e }))
  }
  return post
}

module.exports = {
  getPost,
  listPosts,
  createPost,
  votePost,
  bookmarkPost
}
