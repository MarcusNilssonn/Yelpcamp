const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utility/catchAsync');
const Campground = require('../models/campground');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary'); //Get storage from cloudinary index file.
const upload = multer({ storage }); //Upload and store in storage in cloudinary. 


router.route('/') //Using route to chain all routes together that have the same route.
    .get(catchAsync(campgrounds.index))//Route for all campgrounds
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground)); //Make new campground.


//Important to place before router.get id since order matters.
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground)) //Route for each campground based on id.
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground)) //PUT-route to update.
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deletecampground)); //Delete-route to delete.

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));


module.exports = router;