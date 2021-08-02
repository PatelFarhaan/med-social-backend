const { Op } = require('sequelize')
const db = require('../../db/models')
const logger = require('../utils/logger')
const stripeService = require('./stripe.service')

const LIMIT = 10

const getPaymentMethod = async ({ id }, loaderOpts) => db.PaymentMethod.findByPk(id, loaderOpts)

const getUserPaymentMethods = async ({ user, page = 1, limit = LIMIT }, loaderOpts) =>
  db.PaymentMethod.findAndCountAll({
    query: { where: { UserId: user.id } },
    limit,
    offset: limit * (page - 1),
    ...loaderOpts
  })

const deletePaymentMethod = async ({ id, user, force = false }) => {
  const paymentMethods = await db.PaymentMethod.findAll({ where: { UserId: user.id } })
  if (!paymentMethods.length === 0) throw new Error(JSON.stringify({ status: 404, message: 'Payment method not found' }))
  const paymentMethod = paymentMethods.find({ id })
  if (!paymentMethods.length === 1 && paymentMethod && !force)
    throw new Error(
      JSON.stringify({
        status: 400,
        message:
          // eslint-disable-next-line max-len
          "Payment method that would be deleted is the user's last payment method. Please add force = true parameter if the user really wants to delete it"
      })
    )
  if (force) {
    const paidUserSubscriptions = await user.getUserSubscriptions({ where: { paymentMethod: { [Op.ne]: null } } })
    await Promise.all(
      paidUserSubscriptions.map(async subscription => {
        const resp = await stripeService.unsubscribe(subscription.subscriptionId)
        if (resp.status !== 'canceled') throw new Error(JSON.stringify({ status: 400, message: 'Stripe subscription was not canceled' }))
        return subscription.destroy()
      })
    )
  }

  await stripeService.deletePaymentMethod(paymentMethod)
  await paymentMethod.destroy()
  return {
    status: 204,
    message: 'Successfully Deleted'
  }
}

const setDefaultPaymentMethod = async ({ id, user }) => {
  if (!user.stripeCustomerId || !user.paymentMethod)
    throw new Error(JSON.stringify({ status: 400, message: 'User needs to connect a payment method first' }))
  const { stripeCustomerId } = user
  try {
    await stripeService.setDefaultPaymentMethod(stripeCustomerId, id)
    const paymentMethod = await db.PaymentMethod.findOne({ where: { UserId: user.id, id } })
    user.paymentMethod = paymentMethod
    await user.save()
    return { status: 204, message: 'Successfully updated' }
  } catch (e) {
    logger.warn(`setDefaultPaymentMethod:`, e)
    return e
  }
}

module.exports = {
  getPaymentMethod,
  getUserPaymentMethods,
  deletePaymentMethod,
  setDefaultPaymentMethod
}
