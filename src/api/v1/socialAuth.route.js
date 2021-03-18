const express = require('express')
// const passport = require('passport')
const request = require('request')
const {
  twitterLogin: { clientId: twitterClientId, clientSecret: twitterClientSecret, frotendCallbackUrl: twitterFrontendCallbackUrl }
} = require('../../../config/config')
const auth = require('../../middleware/auth')
const { User } = require('../../db/models')
const { exportSafeUser } = require('../../lib/users')
const { tokenService } = require('../../lib/services')

const router = express.Router()

router.post('/twitter/reverse', async (_req, res) =>
  request.post(
    {
      url: 'https://api.twitter.com/oauth/request_token',
      oauth: {
        oauth_callback: encodeURIComponent(twitterFrontendCallbackUrl),
        consumer_key: twitterClientId,
        consumer_secret: twitterClientSecret
      }
    },
    async (err, _r, body) => {
      if (err) {
        return res.status(400).send({ message: err.message })
      }

      const jsonStr = `{ "${body.replace(/&/g, '", "').replace(/=/g, '": "')}"}`
      return res.send(JSON.parse(jsonStr))
    }
  )
)

router.post('/twitter/connect', auth, async (req, res) => {
  request.post(
    {
      url: `https://api.twitter.com/oauth/access_token?oauth_verifier`,
      oauth: {
        consumer_key: twitterClientId,
        consumer_secret: twitterClientSecret,
        token: req.query.oauth_token
      },
      form: { oauth_verifier: req.query.oauth_verifier }
    },
    async (err, _r, body) => {
      if (err) {
        return res.status(400).send({ message: err.message })
      }

      const bodyString = `{ "${body.replace(/&/g, '", "').replace(/=/g, '": "')}"}`
      const parsedBody = JSON.parse(bodyString)

      const { user } = req
      user.twitterUserId = parsedBody.user_id
      const savedUser = await user.save()
      return res.send(savedUser)
    }
  )
})

router.post('/twitter/login', async (req, res) => {
  request.post(
    {
      url: `https://api.twitter.com/oauth/access_token?oauth_verifier`,
      oauth: {
        consumer_key: twitterClientId,
        consumer_secret: twitterClientSecret,
        token: req.query.oauth_token
      },
      form: { oauth_verifier: req.query.oauth_verifier }
    },
    async (err, _r, body) => {
      if (err) {
        return res.status(400).send({ message: err.message })
      }

      const bodyString = `{ "${body.replace(/&/g, '", "').replace(/=/g, '": "')}"}`
      const parsedBody = JSON.parse(bodyString)
      const rawUser = await User.findOne({ where: { twitterUserId: parsedBody.user_id } })
      if (!rawUser) return res.status(404).send({ message: 'No user is linked to this twitter account' })
      const user = exportSafeUser(rawUser)
      const tokens = await tokenService.generateAuthTokens(user)
      return res.send({
        user,
        tokens
      })
    }
  )
})

router.post('/twitter/onboarding', async (req, res) => {
  request.post(
    {
      url: `https://api.twitter.com/oauth/access_token?oauth_verifier`,
      oauth: {
        consumer_key: twitterClientId,
        consumer_secret: twitterClientSecret,
        token: req.query.oauth_token
      },
      form: { oauth_verifier: req.query.oauth_verifier }
    },
    async (err, _r, body) => {
      if (err) {
        return res.status(400).send({ message: err.message })
      }

      const bodyString = `{ "${body.replace(/&/g, '", "').replace(/=/g, '": "')}"}`
      const parsedBody = JSON.parse(bodyString)
      return res.send(parsedBody)
    }
  )
})

module.exports = router
