const express = require('express')
const router = express.Router()
const { ensureAuthenticated } = require('../config/auth.js')
// welcome page
router.get('/', (req, res) => {
  res.render('welcome')
})
// register page
router.get('/register', (req, res) => {
  res.render('register')
})

router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    user: req.user
  })
})

router.get('/dashboardLect', ensureAuthenticated, (req, res) => {
  res.render('dashboardLect', {
    user: req.user
  })
})

module.exports = router
