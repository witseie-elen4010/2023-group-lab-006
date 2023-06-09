// APP.JS in ~/app.js
const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const app = express()
const expressEjsLayout = require('express-ejs-layouts')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const consultRoutes = require('./routes/consult.js')

require('./config/passport')(passport)
// mongoose
mongoose.connect('mongodb+srv://MeetWithMe:psd123@cluster0.hxe24pp.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('connected,,'))
  .catch((err) => console.log(err))

// EJS
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.use(expressEjsLayout)
// BodyParser
app.use(express.urlencoded({ extended: false }))
// express session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
// use flash
app.use(flash())
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  next()
})
// Routes
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))
app.use('/lectInfo', require('./routes/lectInfo'))
app.use('/consult', require('./routes/consult'))
app.use('/', consultRoutes)
// app.use('/dashboard', require())
// app.get('/dashboard', (req, res) => {
//    res.render('dashboardLect');
//  });

// app.listen(3000);
const port = process.env.PORT || 3000
app.listen(port)
console.log('Express server running on port', port)
