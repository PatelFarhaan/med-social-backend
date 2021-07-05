// Resolvers: A map of functions which return data for the schema.
const { updatePUserExpertise } = require('../../../lib/services/pseudouser.service')
const { can } = require('./../auth')

module.exports = {
  Mutation: {
    updatePseudoUserExpertise: can(['admin', 'superadmin']).createResolver(async (_parent, args) => {
      const PseudoUserExpertise = await updatePUserExpertise(args)
      return PseudoUserExpertise
    })
  }
}
