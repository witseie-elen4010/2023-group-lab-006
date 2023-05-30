//LECTURERINFO.JS in MODELS/LECTURERINFO.JS
const mongoose = require('mongoose');
const InfoSchema  = new mongoose.Schema({
  email : {
    type : String,
    required : true
  },
  availDays : {
    type : [Boolean]
  },
  availTimes : {
    type : [[String]]
  },
  consultLength : {
    type : Number,
    default : 1
  },
  maxStudents : {
    type : Number,
    default : 5
  },
  maxConsults: {
    type : Number,
    required : true
  }
});
const lecturerInfo= mongoose.model('lecturerInfo',InfoSchema);

module.exports = lecturerInfo;