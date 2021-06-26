const db = require('../../db/models')
const {
  additionalExperienceVotePoints,
  reputationSources,
  upvotePointsCoefficient,
  downvoteInitialPointValue,
  downvotePointsCoefficient,
  rankingLevelPointsUpperBorder,
  levels,
  reportedPostDeletedByModeratorPoints
} = require('../constants/reputation.constant')

const getAdditionalExpertisePoints = (voteValue, level) => {
  const levelConstants = additionalExperienceVotePoints[level]
  const basePoints = levelConstants.base || 0
  const coefficient = levelConstants.coefficient || 0
  const sign = voteValue > 0 ? 1 : -1
  return sign * (basePoints + (Math.abs(voteValue) - 1) * coefficient)
}

const getLevelFromPoints = points => {
  // eslint-disable-next-line consistent-return
  Object.keys(rankingLevelPointsUpperBorder).forEach(level => {
    if (level === levels.levelFive) return level
    if (points < rankingLevelPointsUpperBorder[level]) return level
  })
  return levels.levelOne
}

const calculateVotedPoints = async (userExpertise, post, author, voteValue, Reputation = db.Reputation) => {
  if (voteValue === 0) return 0

  await Reputation.destroy({
    where: {
      source: reputationSources.VOTED,
      authorId: author.id,
      PostId: post.id
    }
  })

  const isUpvote = voteValue > 0

  const points = isUpvote
    ? 1 + (voteValue - 1) * upvotePointsCoefficient
    : -1 * downvoteInitialPointValue + (voteValue + 1) * downvotePointsCoefficient

  const expertise = await userExpertise.getExpertise()
  const authorUserExpertise = await db.UserExpertise.findOne({
    where: {
      UserId: author.id,
      ExpertiseId: expertise.id
    }
  })
  const authorExpertiseLevel = getLevelFromPoints(authorUserExpertise ? authorUserExpertise.totalPoints : 1)
  const additionalExpertisePoints = getAdditionalExpertisePoints(voteValue, authorExpertiseLevel)
  const total = Number.parseFloat(points + additionalExpertisePoints)
  return total.toFixed(2)
}

const calculateReportedPostDeletedByModerator = async (post, Reputation = db.Reputation) => {
  await Reputation.destroy({ where: { source: reputationSources.VOTED, PostId: post.id } })
  return reportedPostDeletedByModeratorPoints
}

const calculateDeletedPostByModerator = async (post, Reputation = db.Reputation) => {
  await Reputation.destroy({ where: { source: reputationSources.VOTED, PostId: post.id } })
  return 0
}

const reputationPoints = async (userExpertise, post, author, voteValue, source) => {
  switch (source) {
    case reputationSources.ONBOARDED:
      return 100
    case reputationSources.BOOKMARKED:
      return 10
    case reputationSources.OPENED_COLUMN:
      return 100
    case reputationSources.DELETED_POST_BY_MODERATOR:
      return calculateDeletedPostByModerator(post)
    case reputationSources.DELETED_REPORTED_POST_BY_MODERATOR:
      return calculateReportedPostDeletedByModerator(post)
    case reputationSources.VOTED:
      return calculateVotedPoints(userExpertise, post, author, voteValue)
    case reputationSources.PROVIDED_BY_ADMIN:
      return voteValue
    case reputationSources.POSTED:
    default:
      return 1
  }
}

const calculatePoints = async (
  user,
  expertise,
  source,
  post,
  column,
  author,
  voteValue = 0,
  UserExpertise = db.UserExpertise,
  Reputation = db.Reputation
) => {
  const [userExpertise] = await UserExpertise.findOrCreate({
    where: { UserId: user.id, ExpertiseId: expertise.id }
  })
  let points = Number.parseFloat(await reputationPoints(userExpertise, post, author, voteValue, source))
  const currentPoints = await Reputation.sum('value', { where: { UserExpertiseId: userExpertise.id } })
  if (points < 0) {
    points = currentPoints + points >= 0 ? points : -1 * currentPoints
  }

  const reputation = await Reputation.create({
    UserExpertiseId: userExpertise.id,
    value: points,
    PostId: post ? post.id : null,
    authorId: author ? author.id : null,
    ColumnSlug: column ? column.slug : null,
    source
  })

  const finalPoints = await Reputation.sum('value', { where: { UserExpertiseId: userExpertise.id } })

  userExpertise.totalPoints = Math.ceil(finalPoints)
  await userExpertise.save()

  if (getLevelFromPoints(finalPoints) !== getLevelFromPoints(currentPoints)) {
    const userReputations = await Reputation.count({ where: { UserExpertiseId: userExpertise.id } })
    if (userReputations > 1) {
      return reputation
    }
  }

  return reputation
}

module.exports = {
  getAdditionalExpertisePoints,
  calculateVotedPoints,
  calculateReportedPostDeletedByModerator,
  calculatePoints
}
