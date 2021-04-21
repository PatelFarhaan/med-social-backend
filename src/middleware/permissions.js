const { catchErrors } = require('../lib/utils/asyncErrorHandler')

const checkPermissions = roles => async (req, _res, next) => {
  if (!req.user.id) {
    throw new Error('Could not authenticate user')
  }
  if (!roles.includes(req.user.role.type)) {
    throw new Error('User does not have proper access')
  }

  next()
}

const can = roles => catchErrors(checkPermissions(roles))

const graphQlCan = roles => checkPermissions(roles)

module.exports = { can, graphQlCan }
