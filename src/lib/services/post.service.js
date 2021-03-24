const db = require('../../db/models')
const logger = require('../utils/logger')

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
    // include: {
    //   model: db.Column,
    //   as: 'column',
    //   where: {
    //     slug: {
    //       [db.sequelize.Op.eq]: column
    //     }
    //   }
    // },
    limit,
    offset: limit * (page - 1),
    order,
    ...loaderOpts
  })
}

const createPost = async ({ body: { column, stackedPosts, ...postFields } }, user, Post = db.Post) => {
  let post
  try {
    post = await Post.create(postFields)
    await post.setAuthor(user)
    await post.setColumn(column)
    if (postFields.isStacked) {
      await Promise.all(
        stackedPosts.map(async (stackedPost, index) =>
          post.createStackedChild({ content: stackedPost.content, isStacked: true }, { through: { order: index } })
        )
      )
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
