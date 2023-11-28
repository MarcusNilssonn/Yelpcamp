const express = require('express');
const router = express.Router({mergeParams: true}); //Merge all params from app.js with the params from reviews.js
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');

const ExpressError = require('../utility/ExpressError');
const catchAsync = require('../utility/catchAsync');


//Route for making a new review.
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

//Route for deleting a review.
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;