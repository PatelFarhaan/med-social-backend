const express = require('express')
// const passport = require('passport')

const router = express.Router()

// router.get('/linkedin', passport.authenticate('linkedin', { state: true }))
// router.get('/linkedin/callback', passport.authenticate('linkedin'), (req, res) => {
//   // console.warn("req", _req)
//   console.warn("req.user", req.user)
//   // Successful authentication, redirect home.
//   res.json({ user: req.user })
// })

// router.get('/google', passport.authenticate('google', { state: true }))
// router.get('/google/callback', passport.authenticate('google'), (req, res) => {
//   // console.warn("req", _req)
//   console.warn("req.user", req.user)
//   // Successful authentication, redirect home.
//   res.json({ user: req.user })
// })

// router.get('/twitter', passport.authenticate('twitter'))
// router.get('/twitter/callback', passport.authenticate('twitter'), (_req, res) => {
//   // Successful authentication, redirect home.
//   res.json({ status: 200 })
// })

module.exports = router
