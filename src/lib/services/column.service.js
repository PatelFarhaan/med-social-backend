const db = require('../../db/models')
const logger = require('../utils/logger')
const { isStringJSON } = require('../utils/isStringJSON')
const { columnStatuses, columnTypes } = require('../../lib/constants/column.constant')
const { subscriptionTypes, paymentGateways } = require('../../lib/constants/subscription.constant')

const { stripeService } = require('./index')

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
      column.stripePriceId = stripePriceId.id
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

const subscribeToColumn = async ({ body: { column } }, user, Subscription = db.Subscription) => {
  let subscription
  if (column.type === columnTypes.FREE) {
    subscription = await Subscription.create({
      type: subscriptionTypes.COLUMN,
      email: user.email,
      userId: user.id,
      ColumnSlug: column.slug
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
        email: user.email,
        userId: user.id,
        ColumnSlug: column.slug
      })
    } else {
      throw new Error(JSON.stringify({ status: 400, message: 'Stripe Subscription creation was cancelled' }))
    }
  }
  return subscription
}

const unsubscribeToColumn = async ({ body: { column } }, user, Subscription = db.Subscription) => {
  const subscription = await Subscription.findOne({
    where: {
      type: subscriptionTypes.COLUMN,
      email: user.email,
      ColumnSlug: column.slug
    }
  })
  if (!subscription) throw new Error(JSON.stringify({ status: 404, message: 'Subscription not found' }))
  if (column.type === columnTypes.PAID) {
    const resp = await stripeService.unsubscribe(subscription.subscriptionId)
    if (resp.status !== 'canceled') throw new Error(JSON.stringify({ status: 400, message: 'Stripe subscription was not canceled' }))
  }
  await subscription.destroy()
  return {
    status: 204,
    message: 'Subscription successfully deleted'
  }
}

const banUser = async ({ body: { column, bannedUser } }, user) => {
  const author = await column.getAuthor()
  if (author !== user.id) throw new Error(JSON.stringify({ status: 403, message: 'Only the owner of the column is allowed to ban a user' }))
  try {
    await column.addBannedMember(bannedUser.id)
  } catch (e) {
    logger.warn(`banUser: ${e}`)
    const parsedError = isStringJSON(e.message) ? JSON.parse(e.message) : e
    throw new Error(JSON.stringify({ status: parsedError.status ? parsedError.status : 400, message: parsedError.message }))
  }
  return {
    status: 204,
    message: 'Successfully banned user'
  }
}

module.exports = {
  createColumn,
  getColumn,
  listColumns,
  subscribeToColumn,
  unsubscribeToColumn,
  banUser
}
