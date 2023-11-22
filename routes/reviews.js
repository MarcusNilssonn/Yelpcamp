const express = require('express');
const router = express.Router({mergeParams: true}); //Merge all params from app.js with the params from reviews.js
const Campground = require('../models/campground');
const Review = require('../models/review');

const {reviewSchema} = require('../schemas');

const ExpressError = require('../utility/ExpressError');
const catchAsync = require('../utility/catchAsync');

const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',') 
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.post('/', validateReview, catchAsync(async( req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review); //Make our new review
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', catchAsync(async(req, res) => {
    const {id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId}});//Takes the id from reviewId and pulls that one out from reviews-array.
    await Review.findByIdAndDelete(reviewId); //Delete the entire review.
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;