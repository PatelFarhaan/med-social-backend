const db = require('../../db/models')
const logger = require('../utils/logger')
const uploadService = require('./upload.service')
const { isStringJSON } = require('../utils/isStringJSON')
const { reportedContentStatuses } = require('../constants/reportedContent.constant')

const LIMIT = 50

const getPost = async ({ id, hierarchy = true }, loaderOpts) =>
  db.Post.findOne({
    where: { id },
    include: {
      model: db.Post,
      as: 'descendents',
      hierarchy,
      include: {
        model: db.User,
        as: 'author',
        attributes: ['id', 'firstName', 'lastName', 'fullName', 'profilePicture']
      }
    },
    ...loaderOpts
  })

const listPosts = async ({ page = 1, limit = LIMIT, sortBy, sortDirection, column, hierarchy }, loaderOpts) => {
  let order = [['createdAt', 'ASC']]

  const sortFilters = {
    votes: direction => [['votes', direction.toUpperCase()]],
    createdAt: direction => [['createdAt', direction.toUpperCase()]]
  }

  if (Object.hasOwnProperty.call(sortFilters, sortBy)) {
    order = sortFilters[sortBy](sortDirection)
  }

  const columnInclude = {
    model: db.Column,
    as: 'column',
    where: {
      slug: column
    }
  }

  const includeChildren = hierarchy
    ? [
        columnInclude,
        {
          model: db.Post,
          as: 'descendents',
          hierarchy,
          include: {
            model: db.User,
            as: 'author',
            attributes: ['id', 'firstName', 'lastName', 'fullName', 'profilePicture']
          }
        }
      ]
    : [columnInclude]

  return db.Post.findAndCountAll({
    where: {
      isStacked: false,
      isComment: false
    },
    include: includeChildren,
    limit,
    offset: limit * (page - 1),
    order,
    ...loaderOpts
  })
}

const deletePost = async ({ body: { id } }, user, Post = db.Post) => {
  const DBpost = await Post.findByPk(id)
  if (!DBpost) throw new Error({ status: 404, message: 'Post not found' })
  const author = await DBpost.getAuthor()
  if (author.id !== user.id) throw new Error({ status: 400, message: 'Post can only be deleted by the author' })
  await DBpost.destroy()
  return {
    status: 204,
    message: 'Post deleted successfully'
  }
}

const reportPost = async ({ body: { id, reason } }, user, Post = db.Post, ReportedContent = db.ReportedContent) => {
  const DBpost = await Post.findByPk(id)
  if (!DBpost) throw new Error({ status: 404, message: 'Post not found' })
  const postColumn = await DBpost.getColumn()
  await ReportedContent.create({
    reason,
    reporterId: user.id,
    ColumnSlug: postColumn.slug,
    PostId: id
  })
  return {
    status: 204,
    message: 'Reported post successfully'
  }
}

const reviewReportedPost = async ({ body: { id, state } }, user, ReportedContent = db.ReportedContent) => {
  const DBreportedContent = await ReportedContent.findByPk(id)
  if (!DBreportedContent) throw new Error({ status: 404, message: 'Reported Content not found' })
  DBreportedContent.state = state
  DBreportedContent.approvedById = user.id
  const savedReportedPost = await DBreportedContent.save()
  if (state === reportedContentStatuses.APPROVED) {
    const originalPost = await DBreportedContent.getPost()
    await originalPost.destroy()
  }
  return {
    status: 204,
    message: 'Reviewed reported post successfully',
    savedReportedPost
  }
}

const createPost = async ({ body: { column, stackedPosts = [], files = [], ...postFields } }, user, Post = db.Post, Column = db.Column) => {
  let post
  try {
    post = await Post.create(postFields)
    await post.setAuthor(user)
    const existingColumn = await Column.findByPk(column)
    if (!existingColumn) throw new Error({ status: 404, message: 'Column not found' })
    await post.setColumn(column)
    if (stackedPosts.length > 0) {
      await Promise.all(
        stackedPosts.map(async (stackedPost, index) =>
          post.createStackedChild(
            { content: stackedPost.content, isStacked: true, author_id: user.id, columnSlug: column },
            { through: { order: index } }
          )
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
    const parsedError = isStringJSON(e.message) ? JSON.parse(e.message) : e
    throw new Error(JSON.stringify({ status: parsedError.status ? parsedError.status : 400, message: parsedError.message }))
  }
  return post
}

const editPost = async ({ body: { id, content = '' } }, user, Post = db.Post) => {
  let post
  try {
    const dbPost = await Post.findByPk(id)
    if (!dbPost) throw new Error(JSON.stringify({ status: 404, message: 'Post not found' }))
    const author = await dbPost.getAuthor()
    if (author.id !== user.id) throw new Error(JSON.stringify({ status: 400, message: 'Post can only be edited by the author' }))
    dbPost.content = content
    post = await dbPost.save()
  } catch (e) {
    logger.warn(`editPost: ${e.message}`)
    const parsedError = isStringJSON(e.message) ? JSON.parse(e.message) : e
    throw new Error(JSON.stringify({ status: parsedError.status ? parsedError.status : 400, message: parsedError.message }))
  }
  return post
}

const createComment = async ({ body: { id, content = '' } }, user, Post = db.Post) => {
  let comment
  try {
    const DBpost = await Post.findByPk(id)
    if (!DBpost) throw new Error({ status: 404, message: 'Post not found' })
    const column = await DBpost.getColumn()
    comment = await DBpost.createChild({ content, isComment: true, author_id: user.id, columnSlug: column.slug })
  } catch (e) {
    logger.warn(`createComment: ${e.message}`)
    const parsedError = isStringJSON(e.message) ? JSON.parse(e.message) : e
    throw new Error(JSON.stringify({ status: parsedError.status ? parsedError.status : 400, message: parsedError.message }))
  }
  return comment
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
    if (!post) throw new Error({ status: 404, message: 'Post not found' })
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
    const parsedError = isStringJSON(e.message) ? JSON.parse(e.message) : e
    throw new Error(JSON.stringify({ status: parsedError.status ? parsedError.status : 400, message: parsedError.message }))
  }
  return post
}

const bookmarkPost = async ({ body: { id } }, user, Post = db.Post, PostBookmark = db.PostBookmark) => {
  let post
  try {
    post = await Post.findByPk(id)
    if (!post) throw new Error({ status: 404, message: 'Post not found' })
    const existingBookmark = await PostBookmark.findOne({ where: { postId: post.id, userId: user.id } })
    if (existingBookmark) {
      await existingBookmark.destroy()
    } else {
      await post.addUserBookmark(user)
    }
  } catch (e) {
    logger.warn(`votePost: ${e.message}`)
    const parsedError = isStringJSON(e.message) ? JSON.parse(e.message) : e
    throw new Error(JSON.stringify({ status: parsedError.status ? parsedError.status : 400, message: parsedError.message }))
  }
  return post
}

module.exports = {
  getPost,
  listPosts,
  createPost,
  votePost,
  bookmarkPost,
  createComment,
  deletePost,
  editPost,
  reportPost,
  reviewReportedPost
}
