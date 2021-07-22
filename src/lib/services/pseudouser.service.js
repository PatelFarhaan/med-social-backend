const axios = require('axios')
const { Op } = require('sequelize')
const db = require('../../db/models')
const logger = require('../utils/logger')
const { reputationSources } = require('../constants/reputation.constant')
const { calculatePoints } = require('./reputation.service')
const { sequelize } = require('../../db/models')

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
    profilePicture: body.profilePicture ? body.profilePicture : pseudoUser.profileImageUrl,
    profileDescription: body.profileDescription
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

const addPseudoUser = async _handle => {
  await axios.post(`${process.env.RESEARCH_APP}/pusers`, {
    handle: _handle
  })
  return 'success'
}

const fetchPseudoUsersList = async () => db.PseudoUser.findAll()

const fetchPostCountByUserName = async (record, _username) => {
  record.params.posts = await db.PseudoPost.count({
    where: {
      username: _username.toLowerCase(),
      id: {
        [Op.eq]: sequelize.col('conversation_id')
      }
    }
  })
  if (!record.params.active) {
    record.params.columns = 0
    record.params.expertises = 0
  } else if (record.params.active) {
    record.params.columns = 1
    record.params.expertises = 1
  }
  return { record }
}

const updatePUserExpertise = async ({ username, expertises }) => {
  const pseudoUser = await db.PseudoUser.findOne({
    where: { username }
  })
  try {
    if (pseudoUser) {
      pseudoUser.expertises = expertises
      await pseudoUser.save()
    }
  } catch (e) {
    logger.warn(`updatePUserExpertise ${e}`)
  }
  return db.Expertise.findAll({ where: { id: pseudoUser.expertises } })
}

const addPUserExpertise = async ({ username, expertises }) => {
  const pseudoUser = await db.PseudoUser.findOne({
    where: { username }
  })
  try {
    if (pseudoUser) {
      const updatedExpertise = [...pseudoUser.expertises, ...expertises].filter((value, index, self) => self.indexOf(value) === index)
      pseudoUser.expertises = updatedExpertise
      await pseudoUser.save()
    }
  } catch (e) {
    logger.warn(`updatePUserExpertise ${e}`)
  }
  return db.Expertise.findAll({ where: { id: pseudoUser.expertises } })
}

const removePUserExpertise = async ({ username, expertises }) => {
  const pseudoUser = await db.PseudoUser.findOne({
    where: { username }
  })
  try {
    if (pseudoUser) {
      const updatedExpertise = [...pseudoUser.expertises].filter(item => !expertises.includes(item))
      pseudoUser.expertises = updatedExpertise
      await pseudoUser.save()
    }
  } catch (e) {
    logger.warn(`updatePUserExpertise ${e}`)
  }
  return db.Expertise.findAll({ where: { id: pseudoUser.expertises } })
}

const updatePermissionFileUrl = async (username, url) => {
  const pseudoUser = await db.PseudoUser.findOne({
    where: { username }
  })
  try {
    if (pseudoUser) {
      pseudoUser.permissionFileUrl = url
      await pseudoUser.save()
    }
  } catch (e) {
    logger.warn(`updatePUserExpertise ${e}`)
    return null
  }
  return 'success'
}

module.exports = {
  approveUser,
  addPseudoUser,
  fetchPseudoUsersList,
  fetchPostCountByUserName,
  updatePUserExpertise,
  addPUserExpertise,
  removePUserExpertise,
  updatePermissionFileUrl
}
