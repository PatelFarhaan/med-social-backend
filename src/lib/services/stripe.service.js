const Stripe = require('stripe')
const {
  stripe: { secretKey, currency, applicationFeePercentage, endpointSecret }
} = require('../../../config/config')
const logger = require('../utils/logger')

const stripe = new Stripe(secretKey)

const createPrice = async (column, interval = 'month') => {
  try {
    return stripe.prices.create({
      unit_amount: column.price * 100,
      currency,
      recurring: { interval },
      product_data: {
        name: column.name,
        metadata: {
          slug: column.metadata
        }
      },
      metadata: {
        column_name: column.name,
        column_slug: column.slug
      }
    })
  } catch (e) {
    logger.warn(`createPrice ${e}`)
    throw e
  }
}

const createTaxPrice = async (column, interval = 'month') => {
  try {
    return stripe.prices.create({
      unit_amount: Number(column.price * 10),
      currency,
      recurring: { interval },
      product_data: {
        name: 'Tax',
        metadata: {
          slug: `${column.slug}-tax`
        }
      },
      metadata: {
        column_name: column.name,
        column_slug: column.slug
      }
    })
  } catch (e) {
    logger.warn(`createPrice ${e}`)
    throw e
  }
}

const retrivePrice = async stripePriceId => {
  try {
    return stripe.prices.retrieve(stripePriceId)
  } catch (e) {
    logger.warn(`retrivePrice ${e}`)
    throw e
  }
}

const createCustomer = async (user, paymentData) => {
  try {
    return stripe.customers.create({
      payment_method: paymentData.id,
      name: paymentData.payment_name,
      // metadata: { user_id: user.id },
      email: user.email,
      invoice_settings: {
        default_payment_method: paymentData.id
      }
    })
  } catch (e) {
    logger.warn(`createCustomer ${e}`)
    throw e
  }
}

const deleteCustomer = async user => {
  if (user.stripeCustomerId) {
    try {
      return stripe.customers.del(user.stripeCustomerId)
    } catch (e) {
      logger.warn(`deleteCustomer ${e}`)
      throw e
    }
  }
  return {}
}

const deleteStripeConnectedAccount = async user => {
  if (user.stripeUserId) {
    try {
      return stripe.accounts.del(user.stripeUserId)
    } catch (e) {
      logger.warn(`deleteStripeConnectedAccount ${e}`)
      throw e
    }
  }
  return {}
}

const deletePaymentMethod = async paymentMethod => {
  try {
    return stripe.paymentMethods.detach(paymentMethod.id)
  } catch (e) {
    logger.warn(`deletePaymentMethod ${e}`)
    throw e
  }
}

const updatePaymentMethod = async (user, paymentData) => {
  try {
    await stripe.paymentMethods.attach(paymentData.id, {
      customer: user.stripeCustomerId
    })

    await deletePaymentMethod(user)

    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentData.id
      }
    })

    return {
      user,
      paymentData
    }
  } catch (e) {
    logger.warn(`updatePaymentMethod ${e}`)
    throw e
  }
}

const attachPaymentMethodToUser = async (user, paymentData) =>
  user.stripeCustomerId ? createCustomer(user, paymentData) : updatePaymentMethod

const attachPaymentMethod = async (customerId, paymentData) => {
  try {
    await stripe.paymentMethods.attach(paymentData.id, {
      customer: customerId
    })
  } catch (e) {
    logger.warn(`updatePaymentMethod ${e}`)
    throw e
  }
}

const listPaymentMethods = async customerId => {
  try {
    return stripe.paymentMethods.list({
      customer: customerId,
      // Card is the only supported type for now
      type: 'card'
    })
  } catch (e) {
    logger.warn(`listPaymentMethods ${e}`)
    throw e
  }
}

const createSubscription = async (stripeCustomerId, priceId, taxPriceId) => {
  try {
    return stripe.subscriptions.create({
      customer: stripeCustomerId,
      expand: ['latest_invoice.payment_intent'],
      items: [
        {
          price: priceId
        },
        {
          price: taxPriceId
        }
      ]
    })
  } catch (e) {
    logger.warn(`subscribe ${e}`)
    throw e
  }
}

const subscribe = async (stripeCustomerId, priceId, stripeUserId) => {
  try {
    return stripe.subscriptions.create({
      customer: stripeCustomerId,
      application_fee_percentage: applicationFeePercentage,
      transfer_data: {
        destination: stripeUserId
      },
      expand: ['latest_invoice.payment_intent'],
      items: [
        {
          price: priceId
        }
      ]
    })
  } catch (e) {
    logger.warn(`subscribe ${e}`)
    throw e
  }
}

const unsubscribe = async stripeSubscriptionId => {
  try {
    return stripe.subscriptions.del(stripeSubscriptionId)
  } catch (e) {
    logger.warn(`unsubscribe ${e}`)
    throw e
  }
}

const createEvent = async (body, headers) => stripe.webhooks.constructEvent(body, headers, endpointSecret)

module.exports = {
  createPrice,
  retrivePrice,
  createCustomer,
  deleteCustomer,
  deleteStripeConnectedAccount,
  deletePaymentMethod,
  updatePaymentMethod,
  attachPaymentMethodToUser,
  subscribe,
  unsubscribe,
  attachPaymentMethod,
  createSubscription,
  listPaymentMethods,
  createEvent,
  createTaxPrice
}
