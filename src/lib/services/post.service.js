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
    const stackedChildren = await stackedPosts.map(sp => ({ content: sp.content, isStacked: true, author: user.id, column }))
    await Promise.all(
      stackedChildren.map(async (stackedPost, index) => post.createStackedChild(stackedPost, { through: { order: index } }))
    )
  } catch (e) {
    logger.warn(`createPost: ${e}`)
    throw new Error(JSON.stringify({ status: 400, message: e }))
  }
  return post
}

module.exports = {
  getPost,
  listPosts,
  createPost
}
