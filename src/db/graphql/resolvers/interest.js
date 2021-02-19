// Resolvers: A map of functions which return data for the schema.
const { interestService } = require('../../../lib/services')
const { exportSafeModel } = require('../../../lib/utils/exportSafeModel')
// const { can } = require('./../auth')

module.exports = {
  Query: {
    getInterest: async (_parent, { id }) => {
      const interest = await interestService.getInterest({ id })
      return exportSafeModel(interest)
    },
    getInterests: async (_parent, args) => {
      const rawInterests = await interestService.getInterests(args)
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
  }
}
