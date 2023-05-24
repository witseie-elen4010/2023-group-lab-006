const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require("../models/user");

module.exports = function(passport) {
    passport.use('user',
      new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
        // match user
        User.findOne({ email: email })
          .then((user) => {
            if (!user) {
              return done(null, false, { message: 'That email is not registered' });
            }
            // match password
            bcrypt.compare(password, user.password)
              .then((isMatch) => {
                if (isMatch) {
                  return done(null, user);
                } else {
                  return done(null, false, { message: 'Incorrect password' });
                }
              })
              .catch((err) => {
                console.log(err);
              });
          })
          .catch((err) => {
            console.log(err);
          });
      })
    );

    passport.use('Lecturer',
      new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
        // match user
        User.findOne({ email: email })
          .then((user) => {
            if (!user) {
              return done(null, false, { message: 'That email is not registered' });
            }
            // match password
            bcrypt.compare(password, user.password)
              .then((isMatch) => {
                if (isMatch) {
                  return done(null, user);
                } else {
                  return done(null, false, { message: 'Incorrect password' });
                }
              })
              .catch((err) => {
                console.log(err);
              });
          })
          .catch((err) => {
            console.log(err);
          });
      })
    );
  
    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });
  
    passport.deserializeUser(function(id, done) {
      User.findById(id)
        .then((user) => {
          done(null, user);
        })
        .catch((err) => {
          done(err, null);
        });
    });
  };