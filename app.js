const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); //Library to use one template for all views.
const ExpressError = require('./utility/ExpressError');
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