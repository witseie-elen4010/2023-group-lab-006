// users.js in routes/users.js
const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')
const passport = require('passport')
const actionLog = require('../models/actionLog')

// Login handle
router.get('/login', (req, res) => {
  res.render('login')
})
// lecture login handle
router.get('/loginLect', (req, res) => {
  res.render('loginLect')
})

// Register handle
router.get('/register', (req, res) => {
  res.render('register')
})

function isNotComplete (name, email, password, password2) {
  return !name || !email || !password || !password2
}

function doPasswordsMatch (password, password2) {
  return password == password2
}

function isPasswordValidLength (password) {
  return password.length >= 6
}

function buildErrors (name, email, password, password2) {
  const errors = []

  if (isNotComplete(name, email, password, password2)) {
    errors.push({ msg: 'Please fill in all fields' })
  }

  // Check if passwords match
  else if (!doPasswordsMatch(password, password2)) {
    errors.push({ msg: "Passwords don't match" })
  }

  // Check if password is at least 6 characters long
  else if (!isPasswordValidLength(password)) {
    errors.push({ msg: 'Password should be at least 6 characters' })
  }

  return errors
}

async function hashPassword (password) {
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)
}

function buildLog (email) {

}

router.post('/register', async (req, res) => {
  const { name, email, password, password2 } = req.body
  const errors = buildErrors(name, email, password, password2)
  console.log('Name: ' + name + ' email: ' + email + ' pass: ' + password)

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    })
  } else {
    try {
      const user = await User.findOne({ email })

      const newLog = new actionLog({
        actorEmail: req.body.email,
        actionTask: 'Attempted to register'
      })
      const saveLog = newLog.save()

      if (user) {
        errors.push({ msg: 'Email already registered' })
        res.render('register', { errors, name, email, password, password2 })
      } else {
        const newUser = new User({
          name,
          email,
          password
        })

        // Hash password

        newUser.password = hashPassword(newUser.password)

        // Save user
        const savedUser = await newUser.save()
        console.log(savedUser)
        const newLog = new actionLog({
          actorEmail: req.body.email,
          actionTask: 'Successfully registered'
        })
        const saveLog = newLog.save()

        req.flash('success_msg', 'You have now registered!')
        res.redirect('/users/login')
      }
    } catch (err) {
      console.log(err)
      res.sendStatus(500)
    }
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email, type: 'user' })

    let newLog = new actionLog({
      actorEmail: req.body.email,
      actionTask: 'Attempted login as user'
    })
    let saveLog = newLog.save()

    if (!user) {
      // User with the specified email and type not found
      req.flash('error_msg', 'Invalid Login')
      return res.redirect('/users/login')
    }

    newLog = new actionLog({
      actorEmail: req.body.email,
      actionTask: 'Successfully logged in as user'
    })
    saveLog = newLog.save()

    passport.authenticate('user', {
      successRedirect: '/dashboard',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next)
  } catch (err) {
    // Handle the error case
    next(err)
  }
})

router.post('/loginLect', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email, type: 'lect' })

    let newLog = new actionLog({
      actorEmail: req.body.email,
      actionTask: 'Attempted login as lecturer'
    })
    let saveLog = newLog.save()

    if (!user) {
      // User with the specified email and type not found
      req.flash('error_msg', 'Invalid Login')
      return res.redirect('/users/loginLect')
    }

    newLog = new actionLog({
      actorEmail: req.body.email,
      actionTask: 'Successfully logged in as user'
    })
    saveLog = newLog.save()

    passport.authenticate('Lecturer', {
      successRedirect: '/dashboardLect',
      failureRedirect: '/users/loginLect',
      failureFlash: true
    })(req, res, next)
  } catch (err) {
    // Handle the error case
    next(err)
  }
})

// Logout
router.get('/logout', (req, res) => {
  // Logout logic
  req.logout(function (err) {
    if (err) {
      console.log(err)
    }
    req.flash('success_msg', 'Now logged out')
    res.redirect('/')
  })
})

module.exports = { router, isNotComplete, doPasswordsMatch, isPasswordValidLength, buildErrors }
