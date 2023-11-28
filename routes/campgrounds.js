const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utility/catchAsync');
const Campground = require('../models/campground');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


router.route('/') //Using route to chain all routes together that have the same route.
    .get(catchAsync(campgrounds.index))//Route for all campgrounds
    // .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground)); //Make new campground.
    .post(upload.single('image'), (req, res) => { //Look for form data with image and then add in the file attribute to req.
        res.send('It worked');
    })

//Important to place before router.get id since order matters.
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground)) //Route for each campground based on id.
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground)) //PUT-route to update.
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deletecampground)); //Delete-route to delete.

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));


module.exports = router;