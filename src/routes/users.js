// users.js in routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const passport = require('passport');
const actionLog = require('../models/actionLog');

// Login handle
router.get('/login', (req, res) => {
    res.render('login');
});
//lecture login handle
router.get('/loginLect', (req, res) => {
    res.render('loginLect');
});

// Register handle
router.get('/register', (req, res) => {
    res.render('register');
});


router.post('/register', async (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];
    console.log('Name: ' + name + ' email: ' + email + ' pass: ' + password);

    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    // Check if passwords match
    if (password !== password2) {
        errors.push({ msg: "Passwords don't match" });
    }

    // Check if password is at least 6 characters long
    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors: errors,
            name: name,
            email: email,
            password: password,
            password2: password2,
        });
    } else {
        try {
            const user = await User.findOne({ email: email });

            const newLog = new actionLog({
                actorEmail: req.body.email,
                actionTask: "Attempted to register"
            })
            const saveLog = newLog.save()

            if (user) {
                errors.push({ msg: 'Email already registered' });
                res.render('register', { errors, name, email, password, password2 });
            } else {
                const newUser = new User({
                    name: name,
                    email: email,
                    password: password,
                });

                // Hash password
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(newUser.password, salt);
                newUser.password = hash;

                // Save user
                const savedUser = await newUser.save();
                console.log(savedUser);
                const newLog = new actionLog({
                    actorEmail: req.body.email,
                    actionTask: "Successfully registered"
                })
                const saveLog = newLog.save()

                req.flash('success_msg','You have now registered!')            
                res.redirect('/users/login');
            }
        } catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
    }
});

router.post('/login', async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email, type: "user" });

      const newLog = new actionLog({
        actorEmail: req.body.email,
        actionTask: "Attempted login as user"
      })
      const saveLog = newLog.save()
  
      if (!user) {
        // User with the specified email and type not found
        req.flash('error_msg', 'Invalid Login');
        return res.redirect('/users/login');
      }
  
      passport.authenticate('user', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
      })(req, res, next);
    } catch (err) {
      // Handle the error case
      next(err);
    }
  });

router.post('/loginLect', async (req,res,next)=>{
    try {
        const user = await User.findOne({ email: req.body.email, type: "lect" });

        const newLog = new actionLog({
            actorEmail: req.body.email,
            actionTask: "Attempted login as lecturer"
        })
        const saveLog = newLog.save()
    
        if (!user) {
          // User with the specified email and type not found
          req.flash('error_msg', 'Invalid Login');
          return res.redirect('/users/loginLect');
        }
    passport.authenticate('Lecturer',{
        successRedirect : '/dashboardLect',
        failureRedirect : '/users/loginLect',
        failureFlash : true,
        })(req,res,next);
    } catch (err) {
        // Handle the error case
        next(err);
    } 
});

// Logout
router.get('/logout', (req, res) => {
    // Logout logic
    req.logout(function(err) {
        if (err) {
            console.log(err);
        }
        req.flash('success_msg','Now logged out');
        res.redirect('/');
    });
});

module.exports = router;