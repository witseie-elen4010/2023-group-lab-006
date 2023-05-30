//ACTIONLOG.JS in MODELS/ACTIONLOG.JS
const mongoose = require('mongoose');
const logSchema  = new mongoose.Schema({
  actorEmail : {
    type : String,
    required : true
  },
  actionTask : {
    type : String,
    required : true
  },
  actionDate : {
    type : Date,
    default : Date.now
  }

});
const actionLog = mongoose.model('actionLog', logSchema);

module.exports = actionLog;