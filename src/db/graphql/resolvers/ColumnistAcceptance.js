const { stripeService } = require('../../../lib/services')
const { can } = require('./../auth')
// const logger = require('../../../lib/utils/logger')

module.exports = {
  Query: {
    RetrieveStripeStatus: can(['standard', 'admin', 'superadmin']).createResolver(async (_parent, _, { req }) => {
      const { user } = req
      if (!user.stripeUserId) {
        return {
          Status: false,
          Errors: 'No ID registered'
        }
      }
      const Account = await stripeService.RetrieveStripeAccount(user.stripeUserId)
      if (Account.payouts_enabled === true && Account.requirements.errors.length === 0) {
        return {
          Status: true,
          Errors: ''
        }
      }
      return {
        Status: false,
        Errors: JSON.stringify(Account.requirements.errors)
      }
    })
  },
  Mutation: {
    ConnectColumnistToStripe: can(['standard', 'admin', 'superadmin']).createResolver(
      async (_parent, { return_url, refresh_url }, { req }) => {
        const { user } = req
        let StripeAccountID = user.stripeUserId
        if (!user.stripeUserId) {
          StripeAccount = await stripeService.getStripeUserID()
          StripeAccountID = StripeAccount.id
          user.stripeUserId = StripeAccount.id
          await user.save()
        }

        const accountLink = await stripeService.getExpressAccountLink(StripeAccountID, refresh_url, return_url)
        return {
          ConnectUrl: accountLink.url
        }
      }
    )
  }
}
