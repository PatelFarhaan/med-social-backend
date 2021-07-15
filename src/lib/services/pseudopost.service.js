const db = require('../../db/models')
// const logger = require('../utils/logger')

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

  parentPost.approvedPostId = post.id
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
        stackedPost.approvedPostId = stackedChild.id
        await stackedPost.save()
        return stackedChild
      })
    )
  }

  return post
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

module.exports = {
  approvePost,
  getThreadCount
}
