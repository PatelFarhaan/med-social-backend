const { createResolver } = require('./helpers')
const { graphQlCan: can } = require('../../middleware/permissions')

const userCan = features => createResolver(async (_parent, _args, { req }) => can(features)(req, {}, () => {}))

module.exports = { can: userCan }
