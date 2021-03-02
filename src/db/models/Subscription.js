const types = require('../types')
const { subscriptionTypes, paymentGateways, subscriptionStatuses } = require('../../lib/constants/subscription.constant')

module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define(
    'Subscription',
    {
      id: types.get('id'),
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt'),
      paymentMethod: { type: DataTypes.JSONB, field: 'payment_method' },
      paymentGateway: { type: DataTypes.ENUM(Object.keys(paymentGateways)), field: 'payment_gateway' },
      type: { type: DataTypes.ENUM(Object.keys(subscriptionTypes)), defaultValue: subscriptionTypes.COLUMN },
      customerId: { type: DataTypes.STRING, field: 'customer_id' },
      subscriptionId: { type: DataTypes.STRING, field: 'subscription_id' },
      email: { type: DataTypes.STRING, allowNull: false, validate: { min: 3 } },
      state: { type: DataTypes.ENUM(Object.keys(subscriptionStatuses)), defaultValue: subscriptionStatuses.ACTIVE }
    },
    {
      freezeTableName: true
    }
  )

  Subscription.associate = models => {
    Subscription.belongsToMany(models.User, {
      through: 'UserSubscriptions',
      as: 'users'
    })
  }

  // eslint-disable-next-line func-names
  Subscription.prototype.handlePaymentFailed = async function() {
    this.state = subscriptionStatuses.CANCELLED
    this.save()
    return this
  }

  // eslint-disable-next-line func-names
  Subscription.prototype.handlePaymentSucceeded = async function() {
    this.state = subscriptionStatuses.ACTIVE
    this.save()
    return this
  }

  return Subscription
}
