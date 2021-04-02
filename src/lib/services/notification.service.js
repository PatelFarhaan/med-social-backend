const db = require('../../db/models')
// const { notificationCategories, notificationTypes } = require('../constants/notification.constant')

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

module.exports = {
  notifyInApp,
  notify
}
