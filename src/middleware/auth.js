const passport = require('passport')

const verifyCallback = (req, resolve, _reject) => async (_err, user, _info) => {
  // if (err || info || !user) {
  //   console.warn("err", err, info, user)
  //   // return reject(new Error(JSON.stringify({ status: 401, message: 'Please authenticate' })))
  // }
  req.user = user

  resolve()
}

const auth = async (req, res, next) =>
  new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject))(req, res, next)
  })
    .then(() => next())
    .catch(err => next(err))

module.exports = auth
