const types = require('../types')
const {
  subscriptionTypes,
  paymentGateways,
  subscriptionStatuses,
  subscriptionCycles
} = require('../../lib/constants/subscription.constant')

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
      email: { type: DataTypes.STRING, validate: { min: 3 } },
      state: { type: DataTypes.ENUM(Object.keys(subscriptionStatuses)), defaultValue: subscriptionStatuses.ACTIVE },
      amountPerCycle: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      cycle: { type: DataTypes.ENUM(Object.keys(subscriptionCycles)), defaultValue: subscriptionCycles.MONTH },
      cycleLength: { type: DataTypes.INTEGER, defaultValue: 1 }
    },
    {
      freezeTableName: true
    }
  )

  Subscription.associate = models => {
    Subscription.belongsTo(models.User)

    Subscription.belongsTo(models.Column)
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
