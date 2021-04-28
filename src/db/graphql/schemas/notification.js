const { gql } = require('apollo-server-express')

const interestSchema = gql`
  type Query {
    listUserNotifications(page: Int, limit: Int, isRead: Boolean): Interests
  }

  type Mutation {
    markNotificationsAsRead: DefaultPayload
  }

  type Notifications {
    list: [Notification]
    count: Int!
  }

  type Notification {
    id: Int
    data: String
    category: NotificationCategories
    type: NotificationTypes
    createdAt: DateTime
    author: User
    isRead: Boolean
  }

  enum NotificationCategories {
    VOTES
    REPLIES
    BOOKMARKS
    COLUMNS
    INVITATION
    ADMIN
    SUBSCRIPTION
  }

  enum NotificationTypes {
    UPVOTED
    DOWNVOTED
    REPLIED_TO_POST
    REPLIED_TO_REPLY
    QUOTED_POST
    MENTIONED
    COLUMN_INVITATION
    REMOVED_FROM_COLUMN
    INVITATION_ACCEPTED
    INVITATION_EXPIRED
    REACHED_LEVEL
    WRITE_POST_REMINDER
    WRITE_COLUMN_REMINDER
    LEFT_INVITATIONS_REMINDER
    COLUMN_APPROVED_BY_ADMIN
    REPORTED_POST
    NEW_COLUMN_SUBSCRIPTION
    BOOKMARKED_POST
    INVITATION_LIMIT_REMINDER
    SUBSCRIPTION_EXTENDED
    DOWNGRADED_LEVEL
    INVITE_TO_COLUMN
  }
`

module.exports = interestSchema
