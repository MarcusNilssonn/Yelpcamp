//Middleware where we use the built in "isAuthenticated-method" to only let logged in users acess ceratin routes.
module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
}
