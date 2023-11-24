const express = require('express');
const router = express.Router();
const catchAsync = require('../utility/catchAsync');
const User = require('../models/user');
const passport = require('passport');

router.get('/register', (req, res) => {
    res.render('users/register');
})

//Register a user.
router.post('/register', catchAsync(async(req, res) => {
    try {
    const {email, username, password} = req.body;
    const user = new User({email, username});
    const registeredUser = await User.register(user, password); //Takes the entire user-model and a password and hash the password.
    req.flash('success', 'Welcome to Yelp Camp');
    res.redirect('/campgrounds');
} catch(e){
    req.flash('error', e.message);
    res.redirect('register');
}
}));

//Login part.
router.get('/login', (req, res) => {
    res.render('users/login');
})

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => { //passport.autenticate method which uses local strategy (can be other sites aswell), sends an automatic flash and redirect to login if fail.
    req.flash('success', 'Welcome back');
    res.redirect('/campgrounds');
})

module.exports = router;