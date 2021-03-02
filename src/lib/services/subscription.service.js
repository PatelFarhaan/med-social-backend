const db = require('../../db/models')
// const { states } = require('../constants/subscription.constant')
// const logger = require('../utils/logger')
// const stripeService = require('./stripe.service')

const getSubscription = async (stripeInvoice, Subscription = db.Subscription) => {
  const customerId = stripeInvoice.customer
  const subscriptionId = stripeInvoice.subscription

  return Subscription.findOne({
    where: {
      customerId,
      subscriptionId
    }
  })
}

module.exports = {
  getSubscription
}
