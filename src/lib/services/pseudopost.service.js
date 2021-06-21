const db = require('../../db/models')
// const logger = require('../utils/logger')

const approvePost = async ({ id, ColumnSlug }, loaderOpts) => {
  const pseudoPost = await db.PseudoPost.findOne({
    where: { id },
    ...loaderOpts
  })

  const author = await db.User.findOne({
    where: { twitterUsername: pseudoPost.username }
  })

  const post = await db.Post.create({
    ColumnSlug,
    content: pseudoPost.tweet,
    isStacked: false,
    isQuoted: false,
    isComment: false,
    isParent: true,
    order: 1,
    votes: pseudoPost.likesCount,
    comments: 0,
    author
  })

  return post
}

module.exports = {
  approvePost
}
