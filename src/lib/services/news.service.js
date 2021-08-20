const db = require('../../db/models')
const logger = require('../utils/logger')

const PAGE = 1
const LIMIT = 10

const getAllNews = async (page = PAGE, limit = LIMIT) => {
  const offset = limit * (page - 1)
  return db.News.findAll({
    include: {
      model: db.User,
      as: 'newsAuthor',
      attributes: ['id', 'firstName', 'lastName', 'fullName', 'profilePicture', 'username']
    },
    order: [['createdAt', 'DESC']],
    limit,
    offset
  })
}

const getAllUserNews = async (userId, page = PAGE, limit = LIMIT) => {
  const offset = limit * (page - 1)
  return db.News.findAll({
    where: { UserId: userId },
    include: {
      model: db.User,
      as: 'newsAuthor',
      attributes: ['id', 'firstName', 'lastName', 'fullName', 'profilePicture', 'username']
    },
    order: [['createdAt', 'DESC']],
    limit,
    offset
  })
}

const getNews = async slug => {
  const news = await db.News.findOne({
    where: { slug },
    include: {
      model: db.User,
      as: 'newsAuthor',
      attributes: ['id', 'firstName', 'lastName', 'fullName', 'profilePicture', 'username']
    }
  })
  if (!news) throw new Error({ status: 404, message: 'News not found' })
  return news
}

const createNews = async (headline, publisher, link, userId) => {
  let news
  try {
    const slug = headline.toLowerCase().replace(/\s/g, '-')
    news = db.News.create({ headline, slug, publisher, link, UserId: userId })
  } catch (e) {
    logger.warn(`createNews: ${e}`)
  }
  return news
}

const deleteNews = async (id, user) => {
  const cmsNew = await db.News.findByPk(id)
  if (!cmsNew) throw new Error({ status: 404, message: 'News not found' })
  if (cmsNew.UserId !== user.id) throw new Error({ status: 400, message: 'News can only be deleted by the author' })

  await cmsNew.destroy()

  return { status: 204, message: 'News deleted successfully' }
}

const updateNews = async (headline, id, publisher, link, userId) => {
  const cmsNew = await db.News.findOne({
    where: { id, UserId: userId },
    include: {
      model: db.User,
      as: 'newsAuthor',
      attributes: ['id', 'firstName', 'lastName', 'fullName', 'profilePicture', 'username']
    }
  })
  if (!cmsNew) throw new Error({ status: 404, message: 'News not found' })
  try {
    if (headline) {
      cmsNew.headline = headline
      cmsNew.slug = headline.toLowerCase().replace(/\s/g, '-')
    }
    if (publisher) {
      cmsNew.publisher = publisher
    }
    if (link) {
      cmsNew.link = link
    }
    await cmsNew.save()
  } catch (e) {
    logger.warn(`updateNews: ${e}`)
  }

  return cmsNew
}

module.exports = {
  getAllNews,
  getAllUserNews,
  getNews,
  createNews,
  deleteNews,
  updateNews
}
