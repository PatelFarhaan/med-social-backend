const { catchErrors } = require('../lib/utils/asyncErrorHandler')

const checkPermissions = role => async (req, _res, next) => {
  if (!req.user.id) {
    throw new Error('Could not authenticate user')
  }
  if (req.user.role.type !== role) {
    throw new Error('User does not have proper access')
  }

  next()
}

const can = role => catchErrors(checkPermissions(role))

const graphQlCan = role => checkPermissions(role)

module.exports = { can, graphQlCan }
