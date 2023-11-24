const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); //Library to use one template for all views.
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utility/ExpressError');
const mongoSanitize = require("express-mongo-sanitize");
const methodOverride = require('method-override'); //Since forms can only send POST and Get from browser so need method-override to use put, patch, delete etc. 
const Campground = require('./models/campground');
const Review = require('./models/review');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

//Require the routes.
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

//Connect and throw error if failed.
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false}) 
    .then(() => {
        console.log("Database connected")
    })
    .catch(err => {
        console.log("Error")
        console.log(err)
    })

const app = express();

app.engine('ejs', ejsMate); //Tell express to use ejsMate instead of the deafult engine.
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

//use tells express to use whats inputed during every request.
app.use(express.urlencoded({extended: true})); //Parse the body.
app.use(methodOverride('_method')); //Pass in the string to be used for query-string.
app.use(express.static(path.join(__dirname, 'public')))
const sessionConfig = {
    secret: 'Shouldbeabettersecret',
    resave: false, //Remove deprecation warnings.
    saveUninitialized: true, //Remove deprecation warnings.
    cookie: { //Setting some options for the cookie that we get back.
        httpOnly:true, 
        expires: Date.now() + 1000 * 60 * 60 *24 * 7, //Convert the milliseconds and put an expiration date on the cookie. 7 days from now.
        maxAge:1000 * 60 * 60 *24 * 7 
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session()); //So not have to login on every request. Needs to be after sessionConfig.
passport.use(new LocalStrategy(User.authenticate())); //The authentication-method from passport-mongoose applied on the User.

passport.serializeUser(User.serializeUser()); //How we serialize a user and store a user in the session.
passport.deserializeUser(User.deserializeUser()); //How we get a user out of that session.

// app.use(
//     mongoSanitize({
//       replaceWith: "_",
//     })
//   );

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success'); //Setting up a middleware. On every reuest, whatever is in the flash under 'success' we are going to put in to our locals under success.
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({email: 'Mack@gmail.com', username: 'Mack'});
    const newUser = await User.register(user, 'hej123'); //Takes the entire user-model and a password and hash the password.
    res.send(newUser);
})



//Routehandlers
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes); //So that we dont need to specify campground in our routes.
app.use('/campgrounds/:id/reviews', reviewRoutes);


app.get('/', (req, res) => {
    res.render('home')
});

app.all('*', (req, res, next) => { //for all request types and all paths.
    next(new ExpressError('Page not found', 404));
}) 

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err; //Destructure from error and set the to deafult value.
    if(!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', { err });
});

app.listen(3000, ()=> {
    console.log('Serving on port 3000')
});