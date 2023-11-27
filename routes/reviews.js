const express = require('express');
const router = express.Router({mergeParams: true}); //Merge all params from app.js with the params from reviews.js
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');

const ExpressError = require('../utility/ExpressError');
const catchAsync = require('../utility/catchAsync');


//Route for making a new review.
router.post('/', isLoggedIn, validateReview, catchAsync(async( req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review); //Make our new review
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review')
    res.redirect(`/campgrounds/${campground._id}`);
}))

//Route for deleting a review.
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async(req, res) => {
    const {id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId}});//Takes the id from reviewId and pulls that one out from reviews-array.
    await Review.findByIdAndDelete(reviewId); //Delete the entire review.
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;