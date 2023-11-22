const express = require('express');
const router = express.Router();
const catchAsync = require('../utility/catchAsync');
const {campgroundSchema, reviewSchema} = require('../schemas');
const ExpressError = require('../utility/ExpressError');
const Campground = require('../models/campground');

//Validation
const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body); //if error, destructure from result and get the error-part.
    if(error){
        const msg = error.details.map(el => el.message).join(',') //Get details from array and map over.
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => { //Route for all campgrounds
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}));

//Important to place before router.get id since order matters.
router.get('/new', (req, res) => {
    res.render('campgrounds/new');
});



router.get('/:id', catchAsync(async (req, res) => { //Route for each campground based on id.
    const campground = await Campground.findById(req.params.id).populate('reviews'); //get the reviews for the campground.
    res.render('campgrounds/show', {campground});
}));

router.post('/', validateCampground, catchAsync(async(req, res, next) => { //Where the form is submitted to.
    // if(!req.body.campground) throw new ExpressError('Invald campground data', 400);

    const campground = new Campground(req.body.campground); //Create new campground with our submitted form/data.
    await campground.save();
    res.redirect(`/${campground._id}`) //Redirect to new id page.
})) //If error, catch and pass i to next.

router.get('/:id/edit', catchAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id) //look up a campgrounds based on the id.
    res.render('campgrounds/edit', {campground});
}))

//PUT-route to update.
router.put('/:id', validateCampground, catchAsync(async(req, res) => { //Put a middleware before.
    const { id } = req.params; //Gives the id.
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
}));

//Delete-route to delete.
router.delete('/:id', catchAsync(async (req,res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));



module.exports = router;