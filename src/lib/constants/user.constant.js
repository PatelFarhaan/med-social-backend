const publicFields = [
  'id',
  'email',
  'firstName',
  'lastName',
  'fullName',
  'username',
  'profilePicture',
  'isAnonymousUser',
  'pseudoUser',
  'profileDescription',
  'createdAt',
  'title'
]

const privateFields = [
  ...publicFields,
  'paymentMethod',
  'muted_notification_categories',
  'settings',
  'roleId',
  'updatedAt',
  'deactivatedAt',
  'notificationsSeenAt',
  'socialLink',
  'customLink'
]

const systemPrivateFields = [
  ...privateFields,
  'hash',
  'invitatationLimit',
  'invitedBy',
  'googleUserId',
  'linkedinUserId',
  'twitterUserId',
  'stripeUserId',
  'stripeCustomerId'
]

module.exports = {
  publicFields,
  privateFields,
  systemPrivateFields
}
