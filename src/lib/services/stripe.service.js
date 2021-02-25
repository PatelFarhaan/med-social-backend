const Stripe = require('stripe')
const {
  stripe: { secretKey, currency, applicationFeePercentage }
} = require('../../../config/config')

const stripe = Stripe(secretKey)

const createPrice = async column => {
  try {
    return stripe.prices.create({
      unit_amount: column.price * 100,
      currency,
      recurring: { interval: 'month' },
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
    throw e
  }
}

const retrivePrice = async stripePriceId => {
  try {
    return stripe.prices.retrieve(stripePriceId)
  } catch (e) {
    throw e
  }
}

const createCustomer = async (user, paymentData) => {
  try {
    return stripe.customers.create({
      payment_method: paymentData.payment_method_id,
      name: paymentData.payment_name,
      metadata: { user_id: user.id },
      email: user.email,
      invoice_settings: {
        default_payment_method: paymentData.payment_method_id
      }
    })
  } catch (e) {
    throw e
  }
}

const deleteCustomer = async user => {
  if (user.stripeCustomerId) {
    try {
      return stripe.customers.del(user.stripeCustomerId)
    } catch (e) {
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
      throw e
    }
  }
  return {}
}

const deletePaymentMethod = async user => {
  if (user.paymentMethod && user.paymentMethod.id) {
    try {
      return stripe.paymentMethods.detach(user.paymentMethod.id)
    } catch (e) {
      throw e
    }
  }
  return {}
}

const updatePaymentMethod = async (user, paymentData) => {
  try {
    await stripe.paymentMethods.attach(paymentData.payment_method_id, {
      customer: user.stripeCustomerId
    })

    await deletePaymentMethod(user)

    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentData.payment_method_id
      }
    })

    return {
      user,
      paymentData
    }
  } catch (e) {
    throw e
  }
}

const attachPaymentMethod = async (user, paymentData) => (user.stripeCustomerId ? createCustomer(user, paymentData) : updatePaymentMethod)

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
    throw e
  }
}

const unsubscribe = async stripeSubscriptionId => {
  try {
    return stripe.subscriptions.del(stripeSubscriptionId)
  } catch (e) {
    throw e
  }
}

module.exports = {
  createPrice,
  retrivePrice,
  createCustomer,
  deleteCustomer,
  deleteStripeConnectedAccount,
  deletePaymentMethod,
  updatePaymentMethod,
  attachPaymentMethod,
  subscribe,
  unsubscribe
}
