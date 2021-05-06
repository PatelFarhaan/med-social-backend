const db = require('../../db/models')
// const { notificationCategories, notificationTypes } = require('../constants/notification.constant')
const LIMIT = 50

const notifyInApp = async (type, category, data = {}, author = {}, receipients = []) => {
  if (!type) throw new Error(JSON.stringify({ status: 400, message: 'Notification Type is required' }))
  if (!receipients) throw new Error(JSON.stringify({ status: 400, message: 'Notification receipients are required' }))

  const notification = await db.Notification.create({
    type,
    category,
    data,
    authorId: author.id
  })

  await notification.setReceipients(receipients)
  return notification
}

// TODO: Add mailer here instead of separate service

const notify = async (type, category, data = {}, author = {}, receipients = []) => {
  const notification = await notifyInApp(type, category, data, author, receipients)
  return notification
}

const listUserNotifications = async ({ page = 1, limit = LIMIT, isRead }, user, loaderOpts) => {
  const where = {}
  if (isRead) where.isRead = isRead
  return db.Notification.findAndCountAll({
    where,
    include: {
      model: db.User,
      as: 'receipients',
      through: {
        where: {
          UserId: user.id
        }
      }
    },
    limit,
    offset: limit * (page - 1),
    order: [['isRead', 'ASC']],
    ...loaderOpts
  })
}

const markNotificationsAsRead = async user => {
  try {
    await db.sequelize.query(
      `UPDATE "Notification" AS n SET "isRead" = true FROM "NotificationReceipient" AS nr WHERE nr."UserId" = '${
        user.id
      }' AND nr."NotificationId" = n."id" AND n."isRead" = false;`
    )
    return {
      status: 204,
      message: 'Notification succesfully marked as read'
    }
  } catch (e) {
    throw e
  }
}

module.exports = {
  notifyInApp,
  notify,
  listUserNotifications,
  markNotificationsAsRead
}
