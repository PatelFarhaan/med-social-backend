const db = require('../../db/models')
const logger = require('../utils/logger')
const uploadService = require('./upload.service')
const { isStringJSON } = require('../utils/isStringJSON')
const { reportedContentStatuses } = require('../constants/reportedContent.constant')
const { subscriptionStatuses, subscriptionTypes } = require('../constants/subscription.constant')
const { calculatePoints } = require('./reputation.service')
const { reputationSources } = require('../constants/reputation.constant')
const { notificationCategories, notificationTypes } = require('../constants/notification.constant')
const { notify } = require('./notification.service')

const LIMIT = 50

const POSTS_SINGLE_PAGE = (slug, post) => `/columns/${slug}/posts/${post}`

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

const listColumnPosts = async ({ page = 1, limit = LIMIT, sortBy, sortDirection, column, hierarchy }, loaderOpts) => {
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

const listUserPosts = async ({ page = 1, limit = LIMIT, sortBy, sortDirection }, user, loaderOpts) => {
  let order = [['createdAt', 'ASC']]

  const sortFilters = {
    votes: direction => [['votes', direction.toUpperCase()]],
    createdAt: direction => [['createdAt', direction.toUpperCase()]]
  }

  if (Object.hasOwnProperty.call(sortFilters, sortBy)) {
    order = sortFilters[sortBy](sortDirection)
  }

  const userColumnSubscriptions = await user.getSubscriptions({
    attributes: ['ColumnSlug'],
    where: { state: subscriptionStatuses.ACTIVE, type: subscriptionTypes.COLUMN }
  })

  if (userColumnSubscriptions.length === 0) {
    return {
      count: 0,
      rows: []
    }
  }

  const mappedColumnSlugs = userColumnSubscriptions.map(item => item.ColumnSlug)

  const columnInclude = {
    model: db.Column,
    where: {
      slug: mappedColumnSlugs
    }
  }

  return db.Post.findAndCountAll({
    where: {
      isStacked: false,
      isComment: false
    },
    include: columnInclude,
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
    const existingColumn = await Column.findByPk(column)
    if (!existingColumn) throw new Error({ status: 404, message: 'Column not found' })
    post = await Post.create({ ...postFields, ColumnSlug: column, author_id: user.id })
    if (stackedPosts.length > 0) {
      await Promise.all(
        stackedPosts.map(async (stackedPost, index) =>
          post.createStackedChild(
            { content: stackedPost.content, isStacked: true, author_id: user.id, ColumnSlug: column },
            { through: { order: index } }
          )
        )
      )
    }
    if (files.length > 0) {
      const uploadedFiles = (await Promise.all(files)).map(uploadService.processUploadS3)
      ;(await Promise.all(uploadedFiles)).map(async file => post.createFile({ ...file, UserId: user.id, ColumnSlug: column.slug }))
    }
    const columnExpertise = await existingColumn.getExpertise()
    await calculatePoints(user, columnExpertise, reputationSources.POSTED, post, existingColumn, user)
    const mentionedUsers = await getMentionedUsers(post, stackedPosts)
    if (mentionedUsers.length > 0) {
      await notifyMentionedUser(post, mentionedUsers)
    }
    if (post.isQuoted && post.quoted_post) {
      const quotedPost = await post.getQuotedPost()
      if (quotedPost.author_id !== user.id) {
        const quotedPostAuthor = await quotedPost.getAuthor({ attributes: ['firstName'] })
        await notify(
          notificationTypes.QUOTED_POST,
          notificationCategories.REPLIES,
          {
            toFirstName: quotedPostAuthor.firstName,
            fromName: user.firstName,
            PostId: post.id,
            ColumnSlug: existingColumn.slug,
            actionLink: `${process.env.MOCK_WEBCLIENT_HOST}/${POSTS_SINGLE_PAGE(existingColumn.slug, post.id)}`
          },
          user,
          [quotedPost.author_id]
        )
      }
    }
  } catch (e) {
    logger.warn(`createPost: ${e}`)
    throw e
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
    comment = await DBpost.createChild({ content, isComment: true, author_id: user.id, ColumnSlug: column.slug })
    if (DBpost.author_id !== user.id) {
      const DBpostAuthor = await DBpost.getAuthor()
      await notify(
        notificationTypes.REPLIED_TO_POST,
        notificationCategories.REPLIES,
        {
          toFirstName: DBpostAuthor.firstName,
          fromName: user.firstName,
          PostId: DBpost.id,
          ColumnSlug: column.slug,
          actionLink: `${process.env.MOCK_WEBCLIENT_HOST}/${POSTS_SINGLE_PAGE(column.slug, DBpost.id)}`
        },
        user,
        [DBpostAuthor.id]
      )
    }
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
    return 1
  }
  await post.decrement('votes', { by: 1 })
  return -1
}

const votePost = async (
  { body: { id, type } },
  user,
  Post = db.Post,
  Vote = db.Vote,
  Reputation = db.Reputation,
  UserExpertise = db.UserExpertise,
  Notification = db.Notification
) => {
  let post
  try {
    let voteValue = 0
    post = await Post.findByPk(id)
    if (!post) throw new Error({ status: 404, message: 'Post not found' })
    const existingVote = await Vote.findOne({ where: { postId: post.id, userId: user.id } })
    const postAuthor = await post.getAuthor()
    const postColumn = await post.getColumn()
    const columnExpertise = await postColumn.getExpertise()
    if (existingVote) {
      const userExpertise = await UserExpertise.findOne({ where: { UserId: postAuthor.id, ExpertiseId: columnExpertise.id } })
      await Reputation.destroy({
        where: {
          PostId: post.id,
          authorId: user.id,
          UserExpertiseId: userExpertise.id,
          ColumnSlug: postColumn.slug,
          source: reputationSources.VOTED
        }
      })
      await Notification.destroy({
        where: {
          PostId: post.id,
          authorId: user.id
        }
      })
      if (existingVote.type === type) {
        await existingVote.destroy()
      } else {
        existingVote.type = type
        await existingVote.save()
        voteValue = await updateVoteValue(type, post)
        // TODO: Refactor this after the 0.5 release to adhere with DRY
        await calculatePoints(postAuthor, columnExpertise, reputationSources.VOTED, post, postColumn, user, voteValue)
        if (voteValue > 0 && postAuthor.id !== user.id) {
          await notify(
            notificationTypes.UPVOTED,
            notificationCategories.VOTES,
            {
              PostId: post.id,
              ColumnSlug: postColumn.slug,
              actionLink: `${process.env.MOCK_WEBCLIENT_HOST}/${POSTS_SINGLE_PAGE(postColumn.slug, post.id)}`
            },
            user,
            [postAuthor.id]
          )
        }
      }
    } else {
      await post.addUserVote(user, { through: { type } })
      voteValue = await updateVoteValue(type, post)
      await calculatePoints(postAuthor, columnExpertise, reputationSources.VOTED, post, postColumn, user, voteValue)
      if (voteValue > 0 && postAuthor.id !== user.id) {
        await notify(
          notificationTypes.UPVOTED,
          notificationCategories.VOTES,
          {
            PostId: post.id,
            ColumnSlug: postColumn.slug,
            actionLink: `${process.env.MOCK_WEBCLIENT_HOST}/${POSTS_SINGLE_PAGE(postColumn.slug, post.id)}`
          },
          user,
          [postAuthor.id]
        )
      }
    }
  } catch (e) {
    logger.warn(`votePost: ${e}`)
    const parsedError = isStringJSON(e.message) ? JSON.parse(e.message) : e
    throw new Error(JSON.stringify({ status: parsedError.status ? parsedError.status : 400, message: parsedError.message }))
  }
  return post
}

const bookmarkPost = async (
  { body: { id } },
  user,
  Post = db.Post,
  PostBookmark = db.PostBookmark,
  UserExpertise = db.UserExpertise,
  Reputation = db.Reputation,
  Notification = db.Notification
) => {
  let post
  try {
    post = await Post.findByPk(id)
    if (!post) throw new Error({ status: 404, message: 'Post not found' })
    const existingBookmark = await PostBookmark.findOne({ where: { postId: post.id, userId: user.id } })
    const postAuthor = await post.getAuthor()
    const postColumn = await post.getColumn()
    const columnExpertise = await postColumn.getExpertise()
    if (existingBookmark) {
      await existingBookmark.destroy()
      const userExpertise = await UserExpertise.findOne({ where: { UserId: postAuthor.id, ExpertiseId: columnExpertise.id } })
      await Reputation.destroy({
        where: {
          PostId: post.id,
          UserExpertiseId: userExpertise.id,
          ColumnSlug: postColumn.slug,
          source: reputationSources.BOOKMARKED,
          authorId: user.id
        }
      })
      await Notification.destroy({ where: { authorId: user.id, PostId: post.id } })
    } else {
      await post.addUserBookmark(user)
      if (postAuthor.id !== user.id) {
        await calculatePoints(postAuthor, columnExpertise, reputationSources.BOOKMARKED, post, postColumn, user)
        await notify(
          notificationTypes.BOOKMARKED_POST,
          notificationCategories.BOOKMARKS,
          {
            PostId: post.id,
            ColumnSlug: postColumn.slug,
            actionLink: `${process.env.MOCK_WEBCLIENT_HOST}/${POSTS_SINGLE_PAGE(postColumn.slug, post.id)}`
          },
          user,
          [postAuthor.id]
        )
      }
    }
  } catch (e) {
    logger.warn(`votePost: ${e.message}`)
    const parsedError = isStringJSON(e.message) ? JSON.parse(e.message) : e
    throw new Error(JSON.stringify({ status: parsedError.status ? parsedError.status : 400, message: parsedError.message }))
  }
  return post
}

const getMentionedUsernames = content => content.match(/@([\w]+)\b/gm)

const getMentionedUsers = async (post, stackedPosts = []) => {
  const contentArray = [post, ...stackedPosts]
  const mentionedUsers = []
  contentArray.forEach(item => mentionedUsers.push(getMentionedUsernames(item.content) || []))
  const usernames = [...new Set(mentionedUsers.flat().map(item => item.split('@')[1]))]
  if (usernames.length > 0) {
    return db.User.findAll({ where: { username: usernames } })
  }
  return []
}

const notifyMentionedUser = async (post, mentionedUsers) => {
  const postAuthor = await post.getAuthor()
  const postColumn = await post.getColumn()
  return notify(
    notificationTypes.MENTIONED,
    notificationCategories.REPLIES,
    { postId: post.id, ColumnSlug: postColumn.slug },
    postAuthor,
    mentionedUsers
  )
}

module.exports = {
  getPost,
  listColumnPosts,
  listUserPosts,
  createPost,
  votePost,
  bookmarkPost,
  createComment,
  deletePost,
  editPost,
  reportPost,
  reviewReportedPost
}
