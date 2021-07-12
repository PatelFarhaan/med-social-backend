// Resolvers: A map of functions which return data for the schema.
const { updatePUserExpertise, removePUserExpertise, addPUserExpertise } = require('../../../lib/services/pseudouser.service')
const { can } = require('./../auth')

module.exports = {
  Mutation: {
    updatePseudoUserExpertise: can(['admin', 'superadmin']).createResolver(async (_parent, args) => updatePUserExpertise(args)),
    addPseudoUserExpertise: can(['admin', 'superadmin']).createResolver(async (_parent, args) => addPUserExpertise(args)),
    removePsedoUserExpertise: can(['admin', 'superadmin']).createResolver(async (_parent, args) => removePUserExpertise(args))
  }
}
