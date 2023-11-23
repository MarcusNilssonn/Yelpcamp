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

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

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
app.use(
    mongoSanitize({
      replaceWith: "_",
    })
  );

app.use((req, res, next) => {
    res.locals.success = req.flash('success'); //Setting up a middleware. On every reuest, whatever is in the flash under 'success' we are going to put in to our locals under success.
    res.locals.error = req.flash('error');
    next();
})

//Routehandlers
app.use('/campgrounds', campgrounds); //So that we dont need to specify campground in our routes.
app.use('/campgrounds/:id/reviews', reviews);


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