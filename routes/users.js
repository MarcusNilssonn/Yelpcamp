const express = require('express');
const router = express.Router();
const catchAsync = require('../utility/catchAsync');
const User = require('../models/user');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');

router.get('/register', (req, res) => {
    res.render('users/register');
})

//Register a user.
router.post('/register', catchAsync(async(req, res) => {
    try {
    const {email, username, password} = req.body;
    const user = new User({email, username});
    const registeredUser = await User.register(user, password); //Takes the entire user-model and a password and hash the password.
    req.login(registeredUser, err => { //req.login, function that establish a login. The function requires a callback.
        if(err) return next(err);
        req.flash('success', 'Welcome to Yelp Camp');
        res.redirect('/campgrounds');
    })
} catch(e){
    req.flash('error', e.message);
    res.redirect('register');
}
}));

//Login part.
router.get('/login', (req, res) => {
    res.render('users/login');
})

router.post('/login', storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => { //passport.autenticate method which uses local strategy (can be other sites aswell), sends an automatic flash and redirect to login if fail.
    req.flash('success', 'Welcome back');
    const redirectUrl = res.locals.returnTo || '/campgrounds'; 
    delete req.session.returnTo; //Delete returnTo in session.
    res.redirect(redirectUrl);
})


//Route for logout.
router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'See you again!');
        res.redirect('/campgrounds');
    });
});


module.exports = router;