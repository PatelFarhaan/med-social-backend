const { Router } = require('express')
const bodyParser = require('body-parser')
const logger = require('../../lib/utils/logger')
const db = require('../../db/models')
const { stripeService, subscriptionService } = require('../../lib/services')
const { version } = require('./../../../package.json')

module.exports = () => {
  const api = Router()

  api.get('*', async (req, res, next) => {
    if (!/api/.test(req.url)) {
      return res.status(400).json({ errors: 'Bad Request' })
    }
    return next()
  })

  api.get('/api/v1', (_req, res) => {
    const protocolVersion = 1
    res.json({ version, protocolVersion })
  })

  // eslint-disable-next-line consistent-return
  api.route('/api/v1/webhooks/stripe').post(bodyParser.raw({ type: '*/*' }), async (req, res) => {
    let event
    try {
      event = await stripeService.createEvent(req.body, req.headers['stripe-signature'])
    } catch (err) {
      logger.warn('err', err)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        if (invoice.status === 'paid') {
          const subscription = await subscriptionService.getSubscription(invoice)
          await subscription.handlePaymentSucceeded()
          // TODO: Add mailer and special handling for columns
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        logger.log('invoice.payment_failed', invoice)
        const subscription = await subscriptionService.getSubscription(invoice)
        await subscription.handlePaymentFailed()
        // TODO: Add mailer and column subscription delete
        break
      }

      case 'customer.subscription.deleted': {
        const subscriptionDetails = event.data.object
        logger.log('customer.subscription.deleted', subscriptionDetails)
        const cancelledSubscription = await db.Subscription.findOne({
          where: {
            subscriptionId: subscriptionDetails.id
          }
        })

        await cancelledSubscription.handlePaymentFailed()

        // TODO: Add mailer and column subscription delete
        break
      }

      default:
        logger.info('Unhandled event')
        break
    }

    res.status(200).end()
  })

  return api
}
