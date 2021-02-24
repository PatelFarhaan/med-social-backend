// Resolvers: A map of functions which return data for the schema.
const { interestService } = require('../../../lib/services')
const { exportSafeModel } = require('../../../lib/utils/exportSafeModel')
// const { can } = require('./../auth')

module.exports = {
  Query: {
    getInterest: async (_parent, { id }, { db, context, EXPECTED_OPTIONS_KEY }) => {
      const interest = await db.Expertise.findByPk(id, { [EXPECTED_OPTIONS_KEY]: context })
      return exportSafeModel(interest)
    },
    getInterests: async (_parent, args, { context, EXPECTED_OPTIONS_KEY }) => {
      const rawInterests = await interestService.getInterests(args, { [EXPECTED_OPTIONS_KEY]: context })
      const interests = rawInterests.rows.map(interest => exportSafeModel(interest))
      return {
        list: interests,
        count: interests.length
      }
    }
  },
  Mutation: {
    createInterest: async (_parent, body) => {
      const interest = await interestService.createInterest({ body })
      return exportSafeModel(interest)
    }
  },
  Interest: {
    expertises: (interest, { limit = 10, page = 1 }, { db, context, EXPECTED_OPTIONS_KEY }) => {
      const int = db.Interest.build(exportSafeModel(interest))
      return int.getExpertises({ limit, page, [EXPECTED_OPTIONS_KEY]: context })
    }
  }
}
