const reputationSources = {
  ONBOARDED: 'ONBOARDED',
  POSTED: 'POSTED',
  BOOKMARKED: 'BOOKMARKED',
  OPENED_COLUMN: 'OPENED_COLUMN',
  DELETED_POST_BY_MODERATOR: 'DELETED_POST_BY_MODERATOR',
  DELETED_REPORTED_POST_BY_MODERATOR: 'DELETED_REPORTED_POST_BY_MODERATOR',
  VOTED: 'VOTED',
  PROVIDED_BY_ADMIN: 'PROVIDED_BY_ADMIN'
}

const levelOne = 1
const levelTwo = 2
const levelThree = 3
const levelFour = 4
const levelFive = 5

const levels = { levelOne, levelTwo, levelThree, levelFour, levelFive }

const highestLevel = levelFive

const rankingLevelPointsUpperBorder = {
  [levelOne]: 100,
  [levelTwo]: 1000,
  [levelThree]: 5000,
  [levelFour]: 10000,
  [levelFive]: null
}

const upvotePointsCoefficient = 0.02
const downvoteInitialPointValue = 0.5
const downvotePointsCoefficient = 0.01
const reportedPostDeletedByModeratorPoints = -1000

const additionalExperienceVotePoints = {
  [levelOne]: {
    base: 0,
    coefficient: 0
  },
  [levelTwo]: {
    base: 2,
    coefficient: 0.04
  },
  [levelThree]: {
    base: 4,
    coefficient: 0.08
  },
  [levelFour]: {
    base: 8,
    coefficient: 0.16
  },
  [levelFive]: {
    base: 16,
    coefficient: 0.29
  }
}

module.exports = {
  reputationSources,
  levels,
  highestLevel,
  rankingLevelPointsUpperBorder,
  upvotePointsCoefficient,
  downvoteInitialPointValue,
  downvotePointsCoefficient,
  reportedPostDeletedByModeratorPoints,
  additionalExperienceVotePoints
}
