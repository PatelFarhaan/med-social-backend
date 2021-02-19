const { Router } = require('express')
const { catchErrors } = require('../lib/utils/asyncErrorHandler')
const auth = require('./auth')

module.exports = () => {
  const routes = Router()
  routes.use(
    catchErrors(async (req, res, next) => {
      if (req.url === '/api/health') return res.sendStatus(200)

      // const { headers } = req
      // if (headers.authorization && !!/Bearer/.test(headers.authorization)) {

      //   const [, base64key] = headers.authorization.split(' ')
      //   console.warn("base64key", base64key)
      //   const [basicAuthKey] = Buffer.from(base64key, 'base64')
      //     .toString('ascii')
      //     .split(':')
      //   // NOTE: Pass basicAuthKey down to any route that needs it.
      //   // Can be decoded on a per-route basis.
      //   req.basicAuthKey = basicAuthKey
      //   console.warn("basicAuthKey", basicAuthKey)
      // }
      return next()
    }),
    auth
  )

  return routes
}
