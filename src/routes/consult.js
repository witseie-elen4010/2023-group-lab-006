const express = require('express');
const router = express.Router();
const consult = require('../models/consultation');
const lectInfo = require('../models/lecturerInfo');
const {ensureAuthenticated} = require("../config/auth.js");
const lecturerInfo = require('../models/lecturerInfo');
const { findOne } = require('../models/user');

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

    //find the lecturer via the email given
    const foundLecturer = await lecturerInfo.findOne({email: lectEmail})
    if (!foundLecturer) { 
      console.log('lecturer NOT found')
      validBooking = false;
      //add potential error message
    } else {
      //now that the lecturer is found, we can check if this consultation is valid
      
      //check if the date is valid
      const dateGiven = new Date(consultDate)
      const todayDate = Date.now();
      if (dateGiven < todayDate) {
        validBooking = false
        console.log('the date given is before today')
      } else {
        let day = dateGiven.getDay() - 1
        if (day === -1 || day === 5) {
          validBooking = false
          console.log('day cannot be on a weekend')
        } else {
          const isDayAvailable = foundLecturer.availDays[day]
          if (!isDayAvailable) {
            validBooking = false
            console.log('lecturer is not available on this day' )
          } else {
            //date is valid - onto other checks
            //check if the duration exceeds lecturer specified duration
            if (duration > lecturerInfo.consultLength) {
              validBooking = false
              console.log('duration too long')
            }

            //check if the consultation start time is valid
            lectDayTimes = foundLecturer.availTimes[day]
            if (lectDayTimes[0] > consultTime) {
              validBooking = false
              console.log('invalid time booked (too early)')
            }
            
            //add duration to start time and see that this is less than the end time
            let durMin = duration%60;
            let durHour = Math.trunc(duration/60);
            let consultEndMin = (Number(consultTime.slice(3,5)) + durMin)%60
            let consultEndHour = Math.trunc((Number(consultTime.slice(3,5)) + durMin)/60) + durHour + Number(consultTime.slice(0,2))
            let endTimeMins = (consultEndMin.toString()).padStart(2,"0");
            let endTimeHour = (consultEndHour.toString()).padStart(2,"0");
            let consultEndTime = endTimeHour + ':' + endTimeMins
            if (consultEndTime > lectDayTimes[1]){
              validBooking = false
              console.log('consultation end time exceeds lecturer hours')
            }
          }

        }
      }

    }

    //if the booking is valid, then it can be made and saved to the db
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