const express = require('express')
const router = express.Router()
const { ensureAuthenticated } = require('../config/auth.js')
const Consultation = require('../models/consultation')
const LecturerInfo = require('../models/lecturerInfo')
const actionLog = require('../models/actionLog')

// welcome page
router.get('/', (req, res) => {
  res.render('welcome')
})
// register page
router.get('/register', (req, res) => {
  res.render('register')
})

router.get('/dashboardLect', ensureAuthenticated, async (req, res) => {
  const consultations = await Consultation.find({ lecturer: req.user.email })
  res.render('dashboardLect', { consultations, user: req.user })
})

router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    const lecturers = await LecturerInfo.find({})
    const selectedLecturerEmail = req.query.lecturerEmail || '' // Get the selected lecturer email from the query parameters
    const consultations = await Consultation.find({ lecturer: selectedLecturerEmail })

    res.render('dashboard', { lecturers, consultations, selectedLecturerEmail, user: req.user })
  } catch (err) {
    console.log(err)
    res.sendStatus(500)
  }
})

router.get('/actionLog', async (req, res) => {
  const actionLogs = await actionLog.find({})
  res.render('actionLog', { actionLogs })
})

router.get('/lecturerInfo', ensureAuthenticated, async (req, res) => {
  const lecturerInfos = await LecturerInfo.find({})
  const Info = []
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  let dayTimes = ''
  let infoObject = {}
  for (const lectX of lecturerInfos) {
    dayTimes = ''
    for (let i = 0; i < 5; i++) {
      if (lectX.availDays[i]) {
        dayTimes += days[i] + ': ' + lectX.availTimes[i][0] +
          ' to ' + lectX.availTimes[i][1] + '\n'
      }
    }
    infoObject = { email: lectX.email, days: dayTimes }
    Info.push(infoObject)
  }
  res.render('lecturerinfo', { Info })
})

module.exports = router
