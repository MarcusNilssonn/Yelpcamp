const express = require('express');
const router = express.Router();
const catchAsync = require('../utility/catchAsync');
const User = require('../models/user');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));  //Register a user.


router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login', keepSessionInfo: true}), users.login) //passport.autenticate method which uses local strategy (can be other sites aswell), sends an automatic flash and redirect to login if fail.


//Route for logout.
router.get('/logout', users.logout);


module.exports = router;