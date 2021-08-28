const { Op, QueryTypes } = require('sequelize')
const db = require('../../db/models')
const logger = require('../utils/logger')
const { isStringJSON } = require('../utils/isStringJSON')
const { columnStatuses, columnTypes } = require('../../lib/constants/column.constant')
const { subscriptionTypes, paymentGateways, subscriptionStatuses } = require('../../lib/constants/subscription.constant')
const stripeService = require('./stripe.service')
const notificationService = require('./notification.service')
const { notificationCategories, notificationTypes } = require('../constants/notification.constant')

const LIMIT = 50

const COLUMN_SINGLE_PAGE = slug => `/columns/${slug}`

const getColumn = async ({ slug }, loaderOpts) => db.Column.findByPk(slug, loaderOpts)

const listColumns = async ({ interests = [], page = 1, limit = LIMIT, sortBy, sortDirection, includeNonApproved }, loaderOpts) => {
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

  let includeInterestsFilter = []

  if (interests.length !== 0) {
    includeInterestsFilter = {
      model: db.Interest,
      as: 'interests',
      where: {
        id: {
          [Op.in]: interests
        }
      }
    }
  }

  return db.Column.findAndCountAll({
    query,
    limit,
    offset: limit * (page - 1),
    order,
    include: includeInterestsFilter,
    attributes: [
      'slug',
      'description',
      'name',
      'createdAt',
      'price',
      'visibility',
      'state',
      'type',
      'authorId',
      'ExpertiseId',
      [db.sequelize.literal('(SELECT COUNT(*) FROM "Subscription" WHERE "Subscription"."ColumnSlug" = slug)'), 'MemberCount'],
      [db.sequelize.literal('(SELECT COUNT(*) FROM "Post" WHERE "Post"."ColumnSlug" = slug)'), 'PostCount']
    ],
    ...loaderOpts
  })
}

const createColumn = async (
  { body: { interests, expertise, ...columnFields } },
  user,
  Column = db.Column,
  Subscription = db.Subscription
) => {
  let column
  try {
    const dbExpertise = await db.Expertise.findOne({ where: { id: expertise } })
    if (!dbExpertise) throw new Error(JSON.stringify({ status: 404, message: 'Expertise not found' }))
    const dbInterests = await db.Interest.findAll({ where: { id: interests } })
    if (dbInterests.length === 0) throw new Error(JSON.stringify({ status: 404, message: 'Interests not found' }))

    column = await Column.create({ ...columnFields, ExpertiseId: expertise, authorId: user.id })
    if (column.type === columnTypes.PAID) {
      const stripePriceId = await stripeService.createPrice(column)
      const stripeTaxPriceId = await stripeService.createTaxPrice(column)
      column.stripePriceId = stripePriceId.id
      column.stripeTaxPriceId = stripeTaxPriceId.id
      await column.save()
    }

    await Subscription.create({
      type: subscriptionTypes.COLUMN,
      email: user.email,
      UserId: user.id,
      ColumnSlug: column.slug
    })

    await column.addInterest(dbInterests)
  } catch (e) {
    logger.warn(`createColumn: ${e}`)
    // throw new Error(JSON.stringify({ status: 400, message: e }))
    throw e
  }
  return column
}

const subscribeToColumn = async ({ body }, user, Subscription = db.Subscription) => {
  const { column } = body
  let subscription
  const columnAuthor = await column.getAuthor()
  // TODO: This check is for when the column creator needs to be the only one to invite within a private column
  // if (column.visibility === columnVisibilities.PRIVATE && columnAuthor.id !== user.id)
  //   throw new Error(JSON.stringify({ status: 403, message: 'Only column owners can invite to the column' }))

  const existingSubscription = await Subscription.findOne({
    where: {
      type: subscriptionTypes.COLUMN,
      email: user.email,
      UserId: user.id,
      ColumnSlug: column.slug,
      state: subscriptionStatuses.ACTIVE
    }
  })

  if (existingSubscription) throw new Error(JSON.stringify({ status: 400, message: 'User already subscribed to column' }))

  if (column.type === columnTypes.FREE) {
    subscription = await Subscription.create({
      type: subscriptionTypes.COLUMN,
      email: user.email,
      UserId: user.id,
      ColumnSlug: column.slug
    })
  } else {
    const stripeSubscription = await stripeService.createSubscription(user.stripeCustomerId, column.stripePriceId, column.stripeTaxPriceId)
    if (stripeSubscription.latest_invoice.payment_intent.status !== 'cancelled') {
      subscription = await Subscription.create({
        paymentMethod: user.paymentMethod,
        paymentGateway: paymentGateways.STRIPE,
        type: subscriptionTypes.COLUMN,
        customerId: user.stripeCustomerId,
        subscriptionId: stripeSubscription.id,
        email: user.email,
        UserId: user.id,
        ColumnSlug: column.slug,
        paid: true
      })
      await notificationService.notify(
        notificationTypes.NEW_COLUMN_SUBSCRIPTION,
        notificationCategories.SUBSCRIPTION,
        {
          from_name: user.firstName,
          to_first_name: columnAuthor.firstName,
          column_name: column.name,
          column_slug: column.slug,
          actionLink: `${process.env.MOCK_WEBCLIENT_HOST}/${COLUMN_SINGLE_PAGE(column.slug)}`
        },
        user,
        [columnAuthor.id],
        {},
        column
      )
    } else {
      throw new Error(JSON.stringify({ status: 400, message: 'Stripe Subscription creation was cancelled' }))
    }
  }

  if (user.vip) {
    const columnTopPosters = await column.getTopPosters()
    if (columnTopPosters.length < 3) {
      await column.addTopPoster(user, { through: { order: columnTopPosters.length + 1 } })
    } else {
      const lastTopPoster = columnTopPosters[2]
      await column.removeTopPoster(lastTopPoster)
      await column.addTopPoster(user, { through: { order: 3 } })
    }
  }

  return subscription
}

const unsubscribeToColumn = async ({ body: { column } }, user, Subscription = db.Subscription) => {
  const subscription = await Subscription.findOne({
    where: {
      type: subscriptionTypes.COLUMN,
      ColumnSlug: column.slug,
      UserId: user.id
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

const multiColumnUnsubscribe = async ({ columns = [] }, user, Subscription = db.Subscription) => {
  const subscriptions = await Subscription.findAll({
    where: {
      type: subscriptionTypes.COLUMN,
      ColumnSlug: columns.map(c => c.slug),
      UserId: user.id
    }
  })
  if (subscriptions.length === 0) throw new Error(JSON.stringify({ status: 404, message: 'Subscription not found' }))

  const paidColumns = columns.filter(item => item.type === columnTypes.PAID)
  const mappedPaidColumns = paidColumns.map(item => item.slug)
  const mappedPaidColumnSubscriptions = subscriptions.filter(subscription => mappedPaidColumns.includes(subscription.ColumnSlug))

  Promise.all(
    mappedPaidColumnSubscriptions.map(async subscription => {
      const resp = await stripeService.unsubscribe(subscription.subscriptionId)
      if (resp.status !== 'canceled') throw new Error(JSON.stringify({ status: 400, message: 'Stripe subscription was not canceled' }))
    })
  )

  await Subscription.destroy({ where: { id: subscriptions.map(subscription => subscription.id) } })

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

const getPopularColumns = async ({ page = 1, limit = 10, sortBy, sortDirection }, user, loaderOpts, Column = db.Column) => {
  const order = [['createdAt', 'DESC']]
  // const sortFilters = {
  //   postCount: direction => [[db.sequelize.literal('"PostCount"'), direction.toUpperCase()]],
  //   createdAt: direction => [['createdAt', direction.toUpperCase()]]
  // }

  // if (Object.hasOwnProperty.call(sortFilters, sortBy)) {
  //   order = sortFilters[sortBy](sortDirection)
  // }

  const rawUserSubscriptions = await user.getSubscriptions({ attributes: ['ColumnSlug'] })
  const userSubscriptions = rawUserSubscriptions.map(item => item.ColumnSlug)
  return Column.findAndCountAll({
    limit,
    offset: limit * (page - 1),
    order,
    ...loaderOpts,
    where: {
      slug: {
        [Op.notIn]: userSubscriptions
      },
      state: columnStatuses.APPROVED
    },
    attributes: [
      'slug',
      'description',
      'name',
      'createdAt',
      'price',
      'visibility',
      'state',
      'type',
      'authorId',
      'ExpertiseId',
      [db.sequelize.literal('(SELECT COUNT(*) FROM "Subscription" WHERE "Subscription"."ColumnSlug" = slug)'), 'MemberCount'],
      [db.sequelize.literal('(SELECT COUNT(*) FROM "Post" WHERE "Post"."ColumnSlug" = slug)'), 'PostCount']
    ]
    // order: [[db.sequelize.literal('"PostCount"'), 'DESC']]
  })
}

const getPopularcolumnists = async () =>
  db.sequelize.query(
    // eslint-disable-next-line max-len
    `SELECT *, "User".* FROM (
     SELECT DISTINCT ON (t."authorId") *  FROM (
     SELECT  *,  (SELECT COUNT(*) FROM "Post" WHERE "Post"."ColumnSlug" =  "Column"."slug") AS "PostCount"
     FROM "Column"
     WHERE "state" = 'APPROVED'
     ORDER BY "PostCount" DESC
     ) AS t ) AS t2 LEFT JOIN "User" ON t2."authorId" = "User"."id"
     ORDER BY "PostCount" DESC
     LIMIT 10`,
    { type: QueryTypes.SELECT }
  )

const getTopColumns = async ({ page = 1, limit = 10 }) =>
  db.Column.findAll({
    where: { state: columnStatuses.APPROVED },
    limit,
    offset: limit * (page - 1),
    attributes: [
      'slug',
      'description',
      'name',
      'createdAt',
      'price',
      'visibility',
      'state',
      'type',
      'authorId',
      'ExpertiseId',
      [db.sequelize.literal('(SELECT COUNT(*) FROM "Subscription" WHERE "Subscription"."ColumnSlug" = slug)'), 'MemberCount'],
      [db.sequelize.literal('(SELECT COUNT(*) FROM "Post" WHERE "Post"."ColumnSlug" = slug)'), 'PostCount']
    ],
    order: [[db.sequelize.literal('"PostCount"'), 'DESC']]
  })

const isUserSubscribedToColumn = async ({ column }, user, loaderOpts, Subscription = db.Subscription) => {
  const subscription = await Subscription.findOne({ where: { UserId: user.id, ColumnSlug: column }, ...loaderOpts })
  if (subscription) return true
  return false
}

module.exports = {
  createColumn,
  getColumn,
  listColumns,
  subscribeToColumn,
  unsubscribeToColumn,
  banUser,
  getPopularColumns,
  isUserSubscribedToColumn,
  getPopularcolumnists,
  getTopColumns,
  multiColumnUnsubscribe
}
