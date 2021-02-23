// Resolvers: A map of functions which return data for the schema.
const { expertiseService } = require('../../../lib/services')
const { exportSafeModel } = require('../../../lib/utils/exportSafeModel')
// const { can } = require('./../auth')

module.exports = {
  Query: {
    getExpertise: async (_parent, { id }, { db, context, EXPECTED_OPTIONS_KEY }) => {
      const expertise = await db.Expertise.findByPk(id, { [EXPECTED_OPTIONS_KEY]: context })
      return exportSafeModel(expertise)
    },
    getExpertises: async (_parent, args, { context, EXPECTED_OPTIONS_KEY }) => {
      const rawExpertises = await expertiseService.getExpertises(args, { [EXPECTED_OPTIONS_KEY]: context })
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
  },
  Expertise: {
    interests: (expertise, { limit = 10, page = 1 }, { db, EXPECTED_OPTIONS_KEY, context }) => {
      const exp = db.Expertise.build(exportSafeModel(expertise))
      return exp.getInterests({ limit, page, [EXPECTED_OPTIONS_KEY]: context })
    }
  }
}
