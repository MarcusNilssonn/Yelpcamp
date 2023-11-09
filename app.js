const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); //Library to use one template for all views.
const {campgroundSchema} = require('./schemas')
const catchAsync = require('./utility/catchAsync');
const ExpressError = require('./utility/ExpressError');
const methodOverride = require('method-override'); //Since forms can only send POST and Get from browser so need method-override to use put, patch, delete etc. 
const Campground = require('./models/campground');

//Connect and throw error if failed.
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp') 
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

const validateCampground = (req, res, next) => {
   
    const {error} = campgroundSchema.validate(req.body); //if error, destructure from result and get the error-part.
    if(error){
        const msg = error.details.map(el => el.message).join(',') //Get details from array and map over.
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home')
});

app.get('/campgrounds', catchAsync(async (req, res) => { //Route for all campgrounds
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}));

//Important to place before app.get id since order matters.
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});



app.get('/campgrounds/:id', catchAsync(async (req, res) => { //Route for each campground based on id.
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', {campground});
}));

app.post('/campgrounds', validateCampground, catchAsync(async(req, res, next) => { //Where the form is submitted to.
    // if(!req.body.campground) throw new ExpressError('Invald campground data', 400);

    const campground = new Campground(req.body.campground); //Create new campground with our submitted form/data.
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`) //Redirect to new id page.
})) //If error, catch and pass i to next.

app.get('/campgrounds/:id/edit', catchAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id) //look up a campgrounds based on the id.
    res.render('campgrounds/edit', {campground});
}))

//PUT-route to update.
app.put('/campgrounds/:id', validateCampground, catchAsync(async(req, res) => { //Put a middleware before.
    const { id } = req.params; //Gives the id.
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
}));

//Delete-route to delete.
app.delete('/campgrounds/:id', catchAsync(async (req,res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

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