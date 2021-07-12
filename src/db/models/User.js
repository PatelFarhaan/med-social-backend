const formatName = require('./../../lib/utils/createFullNameForDB')
const types = require('../types')
const { tokenize } = require('../tokenizeField')

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.UUIDV4
      },
      lookupId: types.get('lookupId'),
      email: { type: DataTypes.STRING, validate: { min: 3 } },
      firstName: { type: DataTypes.STRING, field: 'first_name' },
      lastName: { type: DataTypes.STRING, field: 'last_name' },
      fullName: { type: DataTypes.STRING },
      hash: { type: DataTypes.STRING },
      username: { type: DataTypes.STRING(150), unique: true },
      profilePicture: { type: DataTypes.TEXT, field: 'profile_picture' },
      isAnonymousUser: { type: DataTypes.BOOLEAN, field: 'is_anonymous_user', defaultValue: false },
      isMigrated: { type: DataTypes.BOOLEAN, field: 'is_migrated', defaultValue: false },
      invitationLimit: { type: DataTypes.INTEGER, field: 'invitation_limit', defaultValue: 5 },
      profileDescription: { type: DataTypes.STRING(150), field: 'profile_description' },
      notificationsSeenAt: { type: DataTypes.DATE, field: 'notifications_seen_at' },
      paymentMethod: { type: DataTypes.JSONB, field: 'payment_method' },
      stripeUserId: { type: DataTypes.STRING(150), field: 'stripe_user_id' },
      googleUserId: { type: DataTypes.STRING(150), field: 'google_user_id' },
      linkedinUserId: { type: DataTypes.STRING(150), field: 'linkedin_user_id' },
      twitterUserId: { type: DataTypes.STRING(150), field: 'twitter_user_id' },
      stripeCustomerId: { type: DataTypes.STRING(150), field: 'stripe_customer_id' },
      muted_notification_categories: {
        type: DataTypes.ARRAY(DataTypes.STRING(64)),
        allowNull: true,
        field: 'muted_notification_categories'
      },
      pseudoUser: { type: DataTypes.BOOLEAN, field: 'pseudouser', defaultValue: false },
      settings: types.get('settings'),
      vip: { type: DataTypes.BOOLEAN, defaultValue: false },
      twitterUsername: { type: DataTypes.STRING },
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt'),
      deactivatedAt: types.get('deactivatedAt'),
      title: { type: DataTypes.STRING },
      socialLink: {
        type: DataTypes.JSONB,
        field: 'social_link',
        allowNull: false,
        defaultValue: {}
      },
      customLink: { type: DataTypes.JSONB, field: 'custom_link', allowNull: false, defaultValue: [] }
    },
    {
      freezeTableName: true
    }
  )

  User.associate = models => {
    User.hasOne(models.NotificationSetting)

    User.belongsTo(models.Role, {
      as: 'role',
      foreignKey: 'roleId'
    })

    User.belongsTo(models.User, {
      foreignKey: 'invited_by',
      as: 'invitedBy'
    })

    User.belongsToMany(models.Interest, {
      through: 'UserInterests',
      as: 'interests'
    })

    User.belongsToMany(models.Expertise, {
      through: models.UserExpertise,
      as: 'expertises'
    })

    User.hasMany(models.UserExpertise, {
      as: 'userExpertises',
      foreignKey: 'UserId'
    })

    User.hasMany(models.Subscription)

    User.belongsToMany(models.Post, {
      through: models.PostBookmark,
      as: 'bookmarks',
      foreignKey: 'userId'
    })

    User.belongsToMany(models.Post, {
      through: models.Vote,
      as: 'postVotes',
      foreignKey: 'UserId'
    })

    User.hasMany(models.Vote)

    User.hasMany(models.ReportedContent)

    User.belongsToMany(models.Notification, {
      through: 'NotificationReceipient',
      as: 'notifications'
    })

    User.hasMany(models.Notification, { as: 'notificationAuthor' })

    User.belongsToMany(models.Column, {
      through: models.TopPeople,
      as: 'topColumns'
    })
  }
  /* eslint-disable no-param-reassign */
  User.addHook('beforeCreate', instance => {
    let fullname = ''
    if (instance.first_name) {
      instance.first_name = formatName(instance.first_name)
      fullname = `${instance.first_name} `
    }
    if (instance.last_name) {
      instance.last_name = formatName(instance.last_name)
      fullname = `${fullname}${formatName(instance.last_name)}`
    }
    if (!instance.firstName) fullname = null
    instance.fullname = fullname
  })

  tokenize(User, 'lookupId')

  return User
}
