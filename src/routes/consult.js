const express = require('express');
const router = express.Router();
const consult = require('../models/consultation');
const lectInfo = require('../models/lecturerInfo');
const {ensureAuthenticated} = require("../config/auth.js");
const lecturerInfo = require('../models/lecturerInfo');

// open booking handle
router.get('/book',ensureAuthenticated , (req, res) => {
  res.render('schedule',{
    user: req.user
    });

});

router.post('/book', ensureAuthenticated , async (req,res,next)=>{
  //get data from form in schedule.ejs
  const {
    lectEmail, 
    consultDate, 
    consultTime, 
    duration
  } = req.body;

  //let todayDate = Date.now

  let organiserUser = req.user

  

  try{

    const newConsult = new consult({
      lecturer: lectEmail,
      organiser: organiserUser.email,
      consultDay: consultDate,
      consultLength: duration,
      consultStart: consultTime
    })

    
    let validBooking = true;
    
    //do validation here

    if (validBooking) {
      console.log('new booking made')
      const saveConsult = newConsult.save()
    }

  }
  catch (err) {
    console.log(err);
    res.sendStatus(500);
  }

});

//
module.exports = router;