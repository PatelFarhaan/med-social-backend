// Resolvers: A map of functions which return data for the schema.
const { expertiseService } = require('../../../lib/services')
const { exportSafeModel } = require('../../../lib/utils/exportSafeModel')
// const { can } = require('./../auth')

module.exports = {
  Query: {
    getExpertise: async (_parent, { id }) => {
      const expertise = await expertiseService.getExpertise({ id })
      return exportSafeModel(expertise)
    },
    getExpertises: async (_parent, args) => {
      const rawExpertises = await expertiseService.getExpertises(args)
      const expertises = rawExpertises.rows.map(expertise => exportSafeModel(expertise))
      return {
        list: expertises,
        count: expertises.length
      }
    }
  },
  Mutation: {
    createExpertise: async (_parent, body) => {
      const expertise = await expertiseService.createExpertise({ body })
      return exportSafeModel(expertise)
    }
  }
}
