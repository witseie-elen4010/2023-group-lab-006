//lectInfo.js in routes/lectInfo.js
const express = require('express');
const router = express.Router();
const lectInfo = require('../models/lecturerInfo');
const {ensureAuthenticated} = require("../config/auth.js");
const lecturerInfo = require('../models/lecturerInfo');
const actionLog = require('../models/actionLog');

// availability handle
router.get('/availability',ensureAuthenticated , (req, res) => {
  res.render('availability',{
    user: req.user
    });

});

router.post('/availability', ensureAuthenticated , async (req,res,next)=>{

  const { 
    Monday, TimeStartMon, TimeEndMon,
    Tuesday, TimeStartTue, TimeEndTue,
    Wednesday, TimeStartWed, TimeEndWed,
    Thursday, TimeStartThu, TimeEndThu,
    Friday, TimeStartFri, TimeEndFri,
    numMinutes, numStudents, numMeetings
  } = req.body;

  // console.log(Monday,TimeEndMon,numMinutes)
  let timeArray = [
    [TimeStartMon, TimeEndMon],
    [TimeStartTue, TimeEndTue],
    [TimeStartWed, TimeEndWed],
    [TimeStartThu, TimeEndThu],
    [TimeStartFri, TimeEndFri]
  ]

  let dayArray = [false, false, false, false, false]

  if (Monday != undefined ){
    //console.log('monday is checked')
    dayArray[0] = true
    //console.log(dayArray[0])
  }
  if (Tuesday != undefined ){
    dayArray[1] = true
  }
  if (Wednesday != undefined ){
    dayArray[2] = true
  }
  if (Thursday != undefined ){
    dayArray[3] = true
  }
  if (Friday != undefined ){
    dayArray[4] = true
  }

  // console.log(typeof Monday)
  //console.log(dayArray)
  //console.log(typeof Number(numMinutes))

  
  // res.render('dashboardLect',{
  //   user: req.user
  //   });
  let user = req.user
  //console.log(user.email)
  
   try{

    const newInfo = new lecturerInfo({
      email: user.email,
      availDays: dayArray,
      availTimes: timeArray,
      consultLength: numMinutes,
      maxStudents: numStudents,
      maxConsults: numMeetings
    })

    // const info = await lecturerInfo.findOneAndUpdate({email: user.email},newInfo)
    const info = await lecturerInfo.deleteOne({email: user.email})
    //const info = await lecturerInfo.findOne({email: user.email})

    
    const saveInfo = newInfo.save()
    console.log('added lect info')

    const newLog = new actionLog({
      actorEmail: user.email,
      actionTask: "Updated their availability information"
    })
    const saveLog = newLog.save()
    
    res.redirect('/dashboardLect')

  } catch (err) {
    console.log(err);
    res.sendStatus(500);
}

});

module.exports = router;