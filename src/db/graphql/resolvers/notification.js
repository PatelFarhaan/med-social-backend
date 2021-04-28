// Resolvers: A map of functions which return data for the schema.
const { notificationService } = require('../../../lib/services')
const { exportSafeModel } = require('../../../lib/utils/exportSafeModel')
const { can } = require('./../auth')

module.exports = {
  Query: {
    listUserNotifications: can(['standard', 'admin', 'superadmin']).createResolver(
      async (_parent, body, { req, context, EXPECTED_OPTIONS_KEY }) => {
        const rawNotifications = await notificationService.listUserNotifications(body, req.user, { [EXPECTED_OPTIONS_KEY]: context })
        const notifications = rawNotifications.rows.map(notif => ({ ...exportSafeModel(notif), data: JSON.stringify(notif.data) }))
        return {
          list: notifications,
          count: rawNotifications.count
        }
      }
    )
  },
  Mutation: {
    markNotificationsAsRead: can(['standard', 'admin', 'superadmin']).createResolver(async (_parent, _body, { req }) =>
      notificationService.markNotificationsAsRead(req.user)
    )
  },
  Notification: {
    author: (notification, { limit = 10, page = 1 }, { db, context, EXPECTED_OPTIONS_KEY }) => {
      const notif = db.Notification.build(exportSafeModel(notification))
      return notif.getAuthor({ limit, page, [EXPECTED_OPTIONS_KEY]: context })
    }
  }
}
