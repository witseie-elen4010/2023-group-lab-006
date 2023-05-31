const express = require('express');
const router  = express.Router();
const {ensureAuthenticated} = require("../config/auth.js")
const Consultation = require('../models/consultation');
const LecturerInfo = require('../models/lecturerInfo');
//welcome page
router.get('/', (req,res)=>{
    res.render('welcome');
})
//register page
router.get('/register', (req,res)=>{
    res.render('register');
})

// router.get('/dashboard',ensureAuthenticated,(req,res)=>{
//     res.render('dashboard',{
//         user: req.user
//         });
// })

// router.get('/dashboardLect',ensureAuthenticated,(req,res)=>{
//     res.render('dashboardLect',{
//         user: req.user
//         });
// })
router.get('/dashboardLect',ensureAuthenticated, async (req, res) => {
    const consultations = await Consultation.find({ lecturer: req.user.email });
    res.render('dashboardLect', { consultations: consultations , user: req.user });
  });

// router.get('/dashboard',ensureAuthenticated, async (req, res) => {
//     const lecturers = await LecturerInfo.find({});
//     res.render('dashboard', {lecturers: lecturers , user: req.user});
//   });
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
    try {
      const lecturers = await LecturerInfo.find({});
      const selectedLecturerEmail = req.query.lecturerEmail || ''; // Get the selected lecturer email from the query parameters
      const consultations = await Consultation.find({ lecturer: selectedLecturerEmail });
  
      res.render('dashboard', { lecturers: lecturers, consultations: consultations, selectedLecturerEmail: selectedLecturerEmail, user: req.user });
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  });

module.exports = router; 