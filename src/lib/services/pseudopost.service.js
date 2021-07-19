const db = require('../../db/models')

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
  pseudopost.approved_post_id from "PseudoPost" as pseudopost
  JOIN "Post" post
  ON pseudopost.username='${username}' 
  and pseudopost.conversation_id=pseudopost.id 
  and pseudopost.retweet=FALSE 
  and pseudopost.reply_to IS NULL 
  and pseudopost.approved_post_id IS NOT NULL 
  and pseudopost.approved_post_id = post.id
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
  approvePost,
  getThreadCount,
  getApprovedPosts
}
