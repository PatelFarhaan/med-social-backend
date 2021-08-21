const db = require('../../db/models')
const logger = require('../utils/logger')

const PAGE = 1
const LIMIT = 10

const getAllSimplepages = async (page = PAGE, limit = LIMIT) =>
  db.SimplePage.findAll({
    order: [['createdAt', 'DESC']],
    limit,
    offset: limit * (page - 1)
  })

const getSimplepage = async id => {
  const simplepage = await db.SimplePage.findOne({ where: { id } })
  if (!simplepage) throw new Error({ status: 404, message: 'SimplePage not found' })
  return simplepage
}

const createSimplepage = async (pageName, effectiveDate, content) => {
  let simplepage
  try {
    const slug = pageName.toLowerCase().replace(/\s/g, '-')
    simplepage = await db.SimplePage.create({ pageName, slug, effectiveDate, content })
  } catch (e) {
    logger.warn(`createSimplepage: ${e}`)
  }
  return simplepage
}

const updateSimplepage = async (pageName, id, effectiveDate, content) => {
  const simplepage = await db.SimplePage.findByPk(id)
  if (!simplepage) throw new Error({ status: 404, message: 'SimplePage not found' })
  try {
    if (pageName) {
      simplepage.pageName = pageName
      simplepage.slug = pageName.toLowerCase().replace(/\s/g, '-')
    }
    //   if (headlineMain) {
    //     simplepage.headlineMain = headlineMain
    //   }
    if (effectiveDate) {
      simplepage.effectiveDate = effectiveDate
    }
    if (content) {
      simplepage.content = content
    }

    await simplepage.save()
  } catch (e) {
    logger.warn(`updateSimplepage: ${e}`)
  }
  return simplepage
}

module.exports = {
  getAllSimplepages,
  getSimplepage,
  createSimplepage,
  updateSimplepage
}
