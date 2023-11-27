const {campgroundSchema, reviewSchema } = require('./schemas');
const ExpressError = require('./utility/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

//Middleware where we use the built in "isAuthenticated-method" to only let logged in users acess ceratin routes.
module.exports.isLoggedIn = (req, res, next) => { //req.user will contain user information (username, password, email).
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl; //returnTo is the URL we want to get redirected back to.
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
}

//Middleware to transer the returnTo value from the session (req.session.returnTo) to the express app res.locals object before the passport.authenticate() function is executed in the /login POST route.
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

//Middleware for Validation
module.exports.validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body); //if error, destructure from result and get the error-part.
    if(error){
        const msg = error.details.map(el => el.message).join(',') //Get details from array and map over.
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//Middleware for Authorization.
module.exports.isAuthor = async(req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id)
    if(!campground.author.equals(req.user._id)){ //If the id of the campground author doesnt match the user of the logged in user.
        req.flash('error', 'You do not have permission to do that.')
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

//Middleware for check if autor to the review.
module.exports.isReviewAuthor = async(req, res, next) => {
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId)
    if(!review.author.equals(req.user._id)){ //If the id of the campground author doesnt match the user of the logged in user.
        req.flash('error', 'You do not have permission to do that.')
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',') 
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}