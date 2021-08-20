// const { Op, QueryTypes } = require('sequelize')
const db = require('../../db/models')
const logger = require('../utils/logger')

const PAGE = 1
const LIMIT = 10
const getAllDispatches = async (page = PAGE, limit = LIMIT) => {
  const offset = limit * (page - 1)
  return db.Dispatch.findAll({
    include: {
      model: db.User,
      as: 'dispatchAuthor',
      attributes: ['id', 'firstName', 'lastName', 'fullName', 'profilePicture', 'username']
    },
    order: [['createdAt', 'DESC']],
    limit,
    offset
  })
}

const getAllUserDispatches = async (userId, page = PAGE, limit = LIMIT) => {
  const offset = limit * (page - 1)

  return db.Dispatch.findAll({
    where: { UserId: userId },
    include: {
      model: db.User,
      as: 'dispatchAuthor',
      attributes: ['id', 'firstName', 'lastName', 'fullName', 'profilePicture', 'username']
    },
    order: [['createdAt', 'DESC']],
    limit,
    offset
  })
}

const getDispatch = async slug => {
  const dispatch = await db.Dispatch.findOne({
    where: { slug },
    include: {
      model: db.User,
      as: 'dispatchAuthor',
      attributes: ['id', 'firstName', 'lastName', 'fullName', 'profilePicture', 'username']
    }
  })
  if (!dispatch) throw new Error({ status: 404, message: 'Dispatch not found' })
  return dispatch
}

const createDispatch = async (title, about, content, imageLink, userId) => {
  let dispatch
  try {
    const slug = title.toLowerCase().replace(/\s/g, '-')
    dispatch = await db.Dispatch.create({ title, slug, about, content, imageLink, UserId: userId })
  } catch (e) {
    logger.warn(`createDispatch: ${e}`)
  }
  return dispatch
}

const deleteDispatch = async (id, user) => {
  const dispatch = await db.Dispatch.findByPk(id)
  if (!dispatch) throw new Error({ status: 404, message: 'Dispatch not found' })
  if (dispatch.UserId !== user.id) throw new Error({ status: 400, message: 'Dispatch can only be deleted by the author' })

  await dispatch.destroy()

  return { status: 204, message: 'Dispatch deleted successfully' }
}

const updateDispatch = async (title, id, about, content, imageLink, userId) => {
  const dispach = await db.Dispatch.findOne({
    where: { id, UserId: userId },
    include: {
      model: db.User,
      as: 'dispatchAuthor',
      attributes: ['id', 'firstName', 'lastName', 'fullName', 'profilePicture', 'username']
    }
  })
  if (!dispach) throw new Error({ status: 404, message: 'Dispatch not found' })
  try {
    if (title) {
      dispach.title = title
      dispach.slug = title.toLowerCase().replace(/\s/g, '-')
    }
    if (about) {
      dispach.about = about
    }
    if (content) {
      dispach.content = content
    }
    if (imageLink) {
      dispach.imageLink = imageLink
    }
    await dispach.save()
  } catch (e) {
    logger.warn(`updateDispatch: ${e}`)
  }

  return dispach
}

module.exports = {
  getAllDispatches,
  getAllUserDispatches,
  getDispatch,
  createDispatch,
  deleteDispatch,
  updateDispatch
}
