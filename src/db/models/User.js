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
      email: { type: DataTypes.STRING, allowNull: false, validate: { min: 3 } },
      firstName: { type: DataTypes.STRING, field: 'first_name' },
      lastName: { type: DataTypes.STRING, field: 'last_name' },
      fullName: { type: DataTypes.STRING },
      hash: { type: DataTypes.STRING },
      username: { type: DataTypes.STRING(150), unique: true },
      profilePicture: { type: DataTypes.TEXT, field: 'profile_picture' },
      isAnonymousUser: { type: DataTypes.BOOLEAN, field: 'is_anonymous_user', defaultValue: false },
      invitationLimit: { type: DataTypes.INTEGER, field: 'invitation_limit', defaultValue: 5 },
      profileDescription: { type: DataTypes.STRING(150), field: 'profile_description' },
      notificationsSeenAt: { type: DataTypes.DATE, field: 'notifications_seen_at' },
      paymentMethod: { type: DataTypes.JSONB, field: 'payment_method' },
      stripeUserId: { type: DataTypes.STRING(150), field: 'stripe_user_id' },
      stripeCustomerId: { type: DataTypes.STRING(150), field: 'stripe_customer_id' },
      muted_notification_categories: {
        type: DataTypes.ARRAY(DataTypes.STRING(64)),
        allowNull: true,
        field: 'muted_notification_categories'
      },
      settings: types.get('settings'),
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt'),
      deactivatedAt: types.get('deactivatedAt')
    },
    {
      freezeTableName: true
    }
  )
  // TODO: ADD RELATIONSHIPS FOR EXPERTISES, INTERESTS, INVITED_BY
  User.associate = models => {
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
      through: models.UserExpertises,
      as: 'expertises'
    })

    User.belongsToMany(models.Subscription, {
      through: 'UserSubscriptions',
      as: 'subscriptions'
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
