const express = require('express');
const router = express.Router();
const catchAsync = require('../utility/catchAsync');
const {campgroundSchema, reviewSchema} = require('../schemas');
const ExpressError = require('../utility/ExpressError');
const Campground = require('../models/campground');
const {isLoggedIn} = require('../middleware');

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
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});



router.get('/:id', catchAsync(async (req, res) => { //Route for each campground based on id.
    var Id_error = 0
    var campground
 
    try{
        campground = await Campground.findById(req.params.id).populate('reviews') //get the reviews for the campground.
    }
    catch(err){
        if (err.kind === 'ObjectId') Id_error = 1 //If trying to go to id without a campground.
    }
    
    if (!campground || Id_error == 1){ 
        req.flash('error','Cannot find that campground!')
        return res.redirect('/campgrounds') 
    }
    res.render('campgrounds/show', {campground})
    
}));

//Make new campground.
router.post('/', isLoggedIn, validateCampground, catchAsync(async(req, res, next) => { //Where the form is submitted to.
    // if(!req.body.campground) throw new ExpressError('Invald campground data', 400);
    const campground = new Campground(req.body.campground); //Create new campground with our submitted form/data.
    await campground.save();
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`campgrounds/${campground._id}`) //Redirect to new id page.
})) //If error, catch and pass i to next.

router.get('/:id/edit', isLoggedIn, catchAsync(async (req,res) => {
    var Id_error = 0
    var campground
 
    try{
        campground = await Campground.findById(req.params.id) //look up a campgrounds based on the id.
    }
    catch(err){
        if (err.kind === 'ObjectId') Id_error = 1 //If trying to go to id without a campground.
    }
    
    if (!campground || Id_error == 1){ 
        req.flash('error','Cannot find that campground!')
        return res.redirect('/campgrounds') 
    }
    res.render('campgrounds/edit', {campground});
}))

//PUT-route to update.
router.put('/:id', isLoggedIn, validateCampground, catchAsync(async(req, res) => { //Put a middleware before.
    const { id } = req.params; //Gives the id.
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${campground._id}`)
}));

//Delete-route to delete.
router.delete('/:id', isLoggedIn, catchAsync(async (req,res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}));



module.exports = router;