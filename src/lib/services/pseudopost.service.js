const db = require('../../db/models')
const { queueStatuses, QUEUE_POST_LIMIT } = require('../constants/pseudoPostQueue.constant')

const schedulePost = async (conversationId, ColumnSlug, username) =>
  db.PseudoPostQueue.create({
    conversationId,
    ColumnSlug,
    username
  })

const approveQueuedPosts = async () => {
  const queue = await db.sequelize.query(
    `SELECT DISTINCT ("username"), *
    FROM "PseudoPostQueue"
    LIMIT ${QUEUE_POST_LIMIT};
    `
  )
  if (queue[0].length > 0) {
    await Promise.all(
      queue[0].map(async item => {
        item.state = queueStatuses.ACTIVE
        const result = await item.save()
        await approvePost(result.conversationId, result.ColumnSlug)
        item.state = queueStatuses.COMPLETED
        return item.save()
      })
    )
  }
}

const approvePost = async (conversationId, ColumnSlug, loaderOpts = {}) => {
  const pseudoPosts = await db.PseudoPost.findAll({
    where: { conversationId, retweet: false, reply_to: null },
    order: [['created_at', 'ASC']],
    ...loaderOpts
  })

  if (!pseudoPosts) throw new Error(JSON.stringify({ status: 404, message: 'conversation id was not found' }))

  const author = await db.User.findOne({
    where: { twitterUsername: pseudoPosts[0].username }
  })

  const postsArray = pseudoPosts.slice()
  const parentPost = postsArray.shift()

  //  eslint-disable-next-line
  let post = await db.Post.create({
    ColumnSlug,
    content: parentPost.tweet,
    isStacked: postsArray.length > 0,
    isQuoted: false,
    isComment: false,
    isParent: true,
    order: 0,
    votes: 0,
    comments: 0,
    author_id: author.id,
    pseudoPost: true
  })

  parentPost.PostId = post.id
  await parentPost.save()

  if (postsArray.length > 0) {
    await Promise.all(
      postsArray.map(async (stackedPost, index) => {
        const stackedChild = await post.createStackedChild(
          {
            content: stackedPost.tweet,
            isStacked: true,
            isParent: false,
            author_id: author.id,
            ColumnSlug,
            order: index + 1,
            stackParentId: post.id,
            pseudoPost: true
          },
          { through: { order: index + 1 } }
        )
        stackedPost.PostId = stackedChild.id
        await stackedPost.save()
        return stackedChild
      })
    )
  }

  return post
}

const deletePost = async conversationId => {
  try {
    await db.PseudoPost.destroy({
      where: { conversationId }
    })
  } catch (e) {
    throw e
  }

  return {
    status: 200,
    message: 'PseudoPost successfully deleted'
  }
}

const getThreadCount = async (username, loaderOpts = {}) => {
  const threadCountArray = await db.PseudoPost.count({
    where: { username, retweet: false, reply_to: null },
    attributes: ['conversation_id'],
    group: 'conversation_id',
    ...loaderOpts
  })
  return threadCountArray.reduce((map, obj) => {
    map[obj.conversation_id] = obj.count
    return map
  }, {})
}

const getApprovedPosts = async username => {
  const rawResult = await db.sequelize.query(
    `select column1.name,ppjoin.* from
  (select 
  post."ColumnSlug",
  pseudopost.id,
  pseudopost.conversation_id,
  pseudopost.created_at,
  pseudopost.user_id,
  pseudopost.username,
  pseudopost.tweet,
  pseudopost.urls, 
  pseudopost.retweet,
  pseudopost.thumbnail,
  pseudopost.urls,
  pseudopost.reply_to,
  pseudopost.quote_url,
  pseudopost."PostId" from "PseudoPost" as pseudopost
  JOIN "Post" post
  ON pseudopost.username='${username}' 
  and pseudopost.conversation_id=pseudopost.id 
  and pseudopost.retweet=FALSE 
  and pseudopost.reply_to IS NULL 
  and pseudopost."PostId" IS NOT NULL 
  and pseudopost."PostId" = post.id
  order by pseudopost.created_at desc
  ) AS ppjoin JOIN "Column" as column1 
  ON ppjoin."ColumnSlug" = column1.slug`
  )
  const approvedPosts = []
  rawResult[0].forEach(params => {
    params.conversationId = params.conversation_id
    delete params.conversation_id
    const post = { params }
    approvedPosts.push(post)
  })
  if (approvedPosts.length) {
    return approvedPosts
  }
  return null
}

module.exports = {
  schedulePost,
  approveQueuedPosts,
  approvePost,
  getThreadCount,
  getApprovedPosts,
  deletePost
}
