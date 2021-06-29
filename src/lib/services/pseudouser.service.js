const db = require('../../db/models')
const logger = require('../utils/logger')
const { reputationSources } = require('../constants/reputation.constant')
const { calculatePoints } = require('./reputation.service')

const approveUser = async (username, body, loaderOpts) => {
  const pseudoUser = await db.PseudoUser.findOne({
    where: { username },
    ...loaderOpts
  })

  const { interests, expertises } = body

  const user = await db.User.build({
    ...body,
    roleId: 3,
    twitterUsername: pseudoUser.username,
    pseudoUser: true,
    profilePicture: body.profilePicture ? body.profilePicture : pseudoUser.profileImageUrl
  })

  let savedUser
  try {
    savedUser = await user.save()

    if (interests) {
      const dbInterests = await db.Interest.findAll({ where: { id: interests } })
      await savedUser.addInterest(dbInterests)
    }

    if (expertises) {
      const dbExpertises = await db.Expertise.findAll({ where: { id: expertises } })
      await savedUser.addExpertise(dbExpertises)
      await calculatePoints(savedUser, dbExpertises[0], reputationSources.ONBOARDED)
    }

    pseudoUser.active = true
    await pseudoUser.save()
  } catch (e) {
    logger.warn(`approveUser ${e}`)
  }
  return savedUser
}

module.exports = {
  approveUser
}
