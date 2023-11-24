//Middleware where we use the built in "isAuthenticated-method" to only let logged in users acess ceratin routes.
module.exports.isLoggedIn = (req, res, next) => { //req.user will contain user information (username, password, email).
    if(!req.isAuthenticated()){
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
}
