const express = require('express');
const router = express.Router();
const consult = require('../models/consultation');
const lectInfo = require('../models/lecturerInfo');
const {ensureAuthenticated} = require("../config/auth.js");
const lecturerInfo = require('../models/lecturerInfo');
const actionLog = require('../models/actionLog');
//const { findOne } = require('../models/user');\
const consultation = require('../models/consultation');
const Consultation = require('../models/consultation');

// open booking handle
router.get('/book',ensureAuthenticated , (req, res) => {
  res.render('schedule',{
    user: req.user
    });

});

router.get('/:email', async (req, res) => {
  const consultations = await consultation.find({lecturer: req.params.email});
  res.json(consultations);
});

router.post('/cancel/:id', async (req, res) => {
  try {
    await consultation.findByIdAndDelete(req.params.id);
    res.redirect('/dashboardLect');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});



// Cancel booking handle
router.post('/cancel1/:id', ensureAuthenticated, async (req, res) => {
  try {
    const consultationId = req.params.id;
    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      req.flash('error_msg', 'Consultation not found');
      return res.redirect('/dashboard');
    }

    // Check if the consultation was made by the current user
    if (consultation.organiser !== req.user.email) {
      req.flash('error_msg', 'You are not authorized to cancel this consultation');
      return res.redirect('/dashboard');
    }

    // Perform cancellation logic
    await Consultation.findByIdAndDelete(consultationId);

    // Log cancellation
    const newLog = new actionLog({
      actorEmail: req.user.email,
      actionTask: 'Successfully canceled booking',
    });
    await newLog.save();

    req.flash('success_msg', 'Booking canceled successfully');
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred');
    res.redirect('/dashboard');
  }
});

// Cancel booking handle
router.post('/join/:id', ensureAuthenticated, async (req, res) => {
  try {
    const consultationId = req.params.id;
    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      req.flash('error_msg', 'Consultation not found');
      return res.redirect('/dashboard');
    }

    // Check if the consultation was made by the current user
    if (consultation.organiser === req.user.email) {
      req.flash('error_msg', 'You are already a part of the consultation '
      +'you organised');
      return res.redirect('/dashboard');
    }

    // Perform cancellation logic
    //await Consultation.findByIdAndDelete(consultationId);
    let consultLect = await lectInfo.findOne({email: consultation.lecturer})
    let newAttendees = consultation.otherAttendees;
    if (!newAttendees.includes(req.user.email) && newAttendees.length < consultLect.maxStudents) {
      newAttendees.push(req.user.email);
      await Consultation.findByIdAndUpdate(consultationId, 
        {otherAttendees: newAttendees});
    } else {
      const newLog = new actionLog({
        actorEmail: req.user.email,
        actionTask: 'Unable to join booking',
      });
      await newLog.save();
      req.flash('error_msg', 'You are already a part of the consultation or'
      +'the consulation is full');
      return res.redirect('/dashboard');
    }

    // Log cancellation
    const newLog = new actionLog({
      actorEmail: req.user.email,
      actionTask: 'Successfully joined booking',
    });
    await newLog.save();

    req.flash('success_msg', 'Joined successfully');
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred');
    res.redirect('/dashboard');
  }
});





router.post('/book', ensureAuthenticated , async (req,res,next)=>{
  //get data from form in schedule.ejs
  const {
    lectEmail, 
    consultDate, 
    consultTime, 
    duration,
    consultTitle
  } = req.body;

  

  let organiserUser = req.user

  

  try{

    //add duration to start time and get the consultation end time
    let durMin = duration%60;
    let durHour = Math.trunc(duration/60);
    let consultEndMin = (Number(consultTime.slice(3,5)) + durMin)%60
    let consultEndHour = Math.trunc((Number(consultTime.slice(3,5)) + 
      durMin)/60) + durHour + Number(consultTime.slice(0,2))

    let endTimeMins = (consultEndMin.toString()).padStart(2,"0");
    let endTimeHour = (consultEndHour.toString()).padStart(2,"0");
    let consultEndTime = endTimeHour + ':' + endTimeMins

    const newConsult = new consult({
      lecturer: lectEmail,
      organiser: organiserUser.email,
      consultDay: consultDate,
      consultLength: duration,
      consultStart: consultTime,
      consultEnd: consultEndTime,
      Title: consultTitle,
      otherAttendees: [organiserUser.email]
    })

    let errMessage = '';    
    let validBooking = true;
    
    //do validation here

    //find the lecturer via the email given
    const foundLecturer = await lecturerInfo.findOne({email: lectEmail})
    if (!foundLecturer) { 
      //console.log('lecturer NOT found')
      errMessage += 'The lecturer email you entered does not belong to '
        +'a lecturer. '
      validBooking = false;
      //add potential error message
    } else {
      //now that the lecturer is found, we can check if this consultation 
      //is valid
      
      //check if the date is valid
      const dateGiven = new Date(consultDate)
      const todayDate = Date.now();
      if (dateGiven < todayDate) {
        validBooking = false
        //console.log('the date given is before today')
        errMessage += 'The date you entered is a day before today. '
      } else {
        let day = dateGiven.getDay() - 1
        if (day === -1 || day === 5) {
          validBooking = false
          //console.log('day cannot be on a weekend')
          errMessage += 'The date you entered is a day on the weekend. '
        } else {
          const isDayAvailable = foundLecturer.availDays[day]
          if (!isDayAvailable) {
            validBooking = false
            //console.log('lecturer is not available on this day' )
            errMessage += 'The lecturer is not available on the day of the '
              + 'date you entered. '
          } else {
            //date is valid - onto other checks
            //check if the duration exceeds lecturer specified duration
            if (duration > foundLecturer.consultLength) {
              validBooking = false
              //console.log('duration too long')
              errMessage += 'The duration you requested is longer than the '
               + 'lecturer is willing to meet for. '
            }

            //check if the consultation start time is valid
            lectDayTimes = foundLecturer.availTimes[day]
            if (lectDayTimes[0] > consultTime) {
              validBooking = false
              //console.log('invalid time booked (too early)')
              errMessage += 'The time you requested the meeting to start is '
               + 'too early. '
            }
            
            //check that consultation end time is valid
            if (consultEndTime > lectDayTimes[1]){
              validBooking = false
              //console.log('consultation end time exceeds lecturer hours')
              errMessage += 'The consulatation will end too late for the '
                + 'lecturer. '
            }
          }

        }
      }

    }

    let noOverlap = true;
    let isNotMax = true;
    //if the booking is valid, then it can be checked against other bookings
    if (validBooking) {
      
      //find other booking with the lecturer for the date and time given 
      const overlapConsult = await consult.find({
        lecturer: lectEmail, 
        consultDay: consultDate
      })

      //cycle through all bookings on the day if any and check if the bookings 
      //overlap the new booking
      for (let bookingX of overlapConsult){ 
        //check if the consult start time is during time of other booking
        if (consultTime > bookingX.consultStart && 
          consultTime < bookingX.consultEnd){
          //console.log('booking starts during other consult')
          errMessage += 'The consulatation you requested starts during another'
          + ' consultation. '
          noOverlap = false;
        }
        //check if the consult end time is during time of the other booking
        if (consultEndTime > bookingX.consultStart && 
          consultEndTime < bookingX.consultEnd){
          //console.log('booking ends during other consult')
          errMessage += 'The consulatation you requested ends during another'
          + ' consultation. '
          noOverlap = false;
        }
      }

      //check that the number of bookings does not exceed max set by lecturer
      if (overlapConsult.length + 1 > foundLecturer.maxConsults) {
        isNotMax = false
        errMessage += 'The maximum number of consulations for this day' +
        ' is already reached.'
      }

      if (noOverlap && isNotMax) {
        console.log('new booking made')
        const saveConsult = newConsult.save()
        //log successful booking
        const newLog = new actionLog({
          actorEmail: organiserUser.email,
          actionTask: "Successfully created new booking"
        })
        const saveLog = newLog.save()

        res.redirect('/dashboard')
      }
      
    }

    if (!validBooking || !noOverlap || !isNotMax) {
      //log unsuccessful booking
      const newLog = new actionLog({
        actorEmail: organiserUser.email,
        actionTask: "Attempted to make invalid new booking"
      })
      const saveLog = newLog.save()
      
      res.send('Invalid booking: ' + errMessage)
    }

  }
  catch (err) {
    console.log(err);
    res.sendStatus(500);
  }

});

//
module.exports = router;