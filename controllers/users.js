const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async(req, res) => {
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
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => { 
    req.flash('success', 'Welcome back');
    const redirectUrl = res.locals.returnTo || '/campgrounds'; 
    delete req.session.returnTo; //Delete returnTo in session.
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => { 
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'See you again!');
        res.redirect('/campgrounds');
    });
}