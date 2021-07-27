const { stripeService } = require('../../../lib/services')
const { can } = require('./../auth')
// const logger = require('../../../lib/utils/logger')

module.exports = {
  Query: {
    RetrieveStripeStatus: async (_parent, _, { req }) => {
      const { user } = req
      const Account = await stripeService.RetrieveStripeAccount(user.stripeUserId)
      if (Account.details_submitted === true) {
        return true
      }
      return false
    }
  },
  Mutation: {
    ConnectColumnistToStripe: can(['standard', 'admin', 'superadmin']).createResolver(
      async (_parent, { return_url, refresh_url }, { req }) => {
        const { user } = req
        const StripeAccountObject = await stripeService.getStripeUserID()
        const accountLink = await stripeService.getExpressAccountLink(StripeAccountObject.id, refresh_url, return_url)
        user.stripeUserId = StripeAccountObject.id
        await user.save()
        return {
          ConnectUrl: accountLink.url
        }
      }
    )
  }
}
