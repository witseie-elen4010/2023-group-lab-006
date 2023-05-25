//LECTURERINFO.JS in MODELS/LECTURERINFO.JS
const mongoose = require('mongoose');
const InfoSchema  = new mongoose.Schema({
  email : {
    type : String,
    required : true
  },
  availDays : {
    type : [String]
  },
  availTimes : {
    type : [String]
  },
  consultLength : {
    type : Number,
    default : 1
  },
  maxStudents : {
    type : Number,
    default : 5
  }
});
const lecturerInfo= mongoose.model('lecturerInfo',InfoSchema);

module.exports = lecturerInfo;