const db = require('../../db/models')
// const logger = require('../utils/logger')

const approvePost = async (conversationId, ColumnSlug, loaderOpts) => {
  const pseudoPosts = await db.PseudoPost.findAll({
    where: { conversationId },
    order: [['created_at', 'ASC']],
    ...loaderOpts
  })

  if (!pseudoPosts) throw new Error(JSON.stringify({ status: 404, message: 'conversation id was not found' }))

  const author = await db.User.findOne({
    where: { twitterUsername: pseudoPosts[0].username }
  })

  const postPromises = pseudoPosts.map(async (pseudoPost, index) =>
    db.Post.create({
      ColumnSlug,
      content: pseudoPost.tweet,
      isStacked: pseudoPosts.length !== 1,
      isQuoted: false,
      isComment: false,
      isParent: true,
      order: index + 1,
      votes: 0,
      comments: 0,
      author
    })
  )
  return Promise.all(postPromises)
}

module.exports = {
  approvePost
}
