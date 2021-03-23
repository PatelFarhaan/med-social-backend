const db = require('../../db/models')
const logger = require('../utils/logger')
const { columnStatuses, columnTypes } = require('../../lib/constants/column.constant')
const { subscriptionTypes, paymentGateways } = require('../../lib/constants/subscription.constant')

const { stripeService } = require('./stripe.service')

const LIMIT = 50

const getColumn = async ({ slug }, loaderOpts) => db.Column.findByPk(slug, loaderOpts)

const listColumns = async ({ page = 1, limit = LIMIT, sortBy, sortDirection, includeNonApproved }, loaderOpts) => {
  let order = [['name', 'ASC']]

  const sortFilters = {
    name: direction => [['name', direction.toUpperCase()]],
    createdAt: direction => [['createdAt', direction.toUpperCase()]]
  }

  if (Object.hasOwnProperty.call(sortFilters, sortBy)) {
    order = sortFilters[sortBy](sortDirection)
  }

  let query = {
    where: {
      state: columnStatuses.APPROVED
    }
  }

  if (!includeNonApproved) {
    query = {}
  }

  return db.Column.findAndCountAll({
    query,
    limit,
    offset: limit * (page - 1),
    order,
    ...loaderOpts,
    attributes: ['slug', 'name', 'createdAt']
  })
}

const createColumn = async ({ body: { interests, expertise, ...columnFields } }, user, Column = db.Column) => {
  let column
  try {
    column = await Column.create(columnFields)
    if (column.type === columnTypes.PAID) {
      const stripePriceId = await stripeService.createPrice(column)
      column.stripePriceId = stripePriceId
      await column.save()
    }
    await column.setAuthor(user)
    const dbInterests = await db.Interest.findAll({ where: { id: interests } })
    await column.addInterest(dbInterests)
    const dbExpertise = await db.Expertise.findOne({ where: { id: expertise } })
    await column.setExpertise(dbExpertise)
  } catch (e) {
    logger.warn(`createColumn: ${e}`)
    throw new Error(JSON.stringify({ status: 400, message: e }))
  }
  return column
}

const subscribeToColumn = async ({ column, user, Subscription = db.Subscription }) => {
  let subscription
  if (column.type === columnTypes.FREE) {
    subscription = await Subscription.create({
      type: subscriptionTypes.COLUMN,
      email: user.email
    })
  } else {
    const stripeSubscription = await stripeService.createSubscription(user.stripeCustomerId, column.stripePriceId)
    if (stripeSubscription.latest_invoice.payment_intent.status !== 'cancelled') {
      subscription = await Subscription.create({
        paymentMethod: user.paymentMethod,
        paymentGateway: paymentGateways.STRIPE,
        type: subscriptionTypes.Column,
        customerId: user.stripeCustomerId,
        subscriptionId: stripeSubscription.id,
        email: user.email
      })
    } else {
      throw new Error(JSON.stringify({ status: 400, message: 'Stripe Subscription creation was cancelled' }))
    }
  }
  await subscription.setUser(user)
  await subscription.setColumn(column)
  return subscription
}

module.exports = {
  createColumn,
  getColumn,
  listColumns,
  subscribeToColumn
}
