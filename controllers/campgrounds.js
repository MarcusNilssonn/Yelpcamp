const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => { 
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async(req, res, next) => { 
    // if(!req.body.campground) throw new ExpressError('Invald campground data', 400);
    const campground = new Campground(req.body.campground); //Create new campground with our submitted form/data.
    campground.image = req.files.map(f => ({url: f.path, filename: f.filename})); //file is an array with info about image (Thanks to Multer). Map over the array and create objects with path and name.
    campground.author = req.user._id; //Set the user id from the made campground to the id of the currently logged in user.
    await campground.save();
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`campgrounds/${campground._id}`) //Redirect to new id page.
}

module.exports.showCampground = async (req, res) => { 
    var Id_error = 0
    var campground
 
    try{
        //get the reviews for the campground and the author for the id by populate them.
        campground = await Campground.findById(req.params.id).populate({
            path: 'reviews',
            populate: {
                path: 'author' //Populate the autor of the reviews.
            }
        }).populate('author') //Populate the author of the campground.
    }
    catch(err){
        if (err.kind === 'ObjectId') Id_error = 1 //If trying to go to id without a campground.
    }
    
    if (!campground || Id_error == 1){ 
        req.flash('error','Cannot find that campground!')
        return res.redirect('/campgrounds') 
    }
    res.render('campgrounds/show', {campground})
    
}

module.exports.renderEditForm = async (req,res) => {
    var Id_error = 0;
    var campground;
    const { id } = req.params;
    try{
        campground = await Campground.findById(id) //look up a campgrounds based on the id.
    }
    catch(err){
        if (err.kind === 'ObjectId') Id_error = 1 //If trying to go to id without a campground.
    }
    //Check if there is a campground.
    if (!campground || Id_error === 1){ 
        req.flash('error','Cannot find that campground!')
        return res.redirect('/campgrounds') 
    }
    res.render('campgrounds/edit', {campground});
}

module.exports.updateCampground = async(req, res) => { 
    const { id } = req.params; //Gives the id.
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}) //Finding and updating all at once.
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename})); //Make an array
    campground.image.push(...imgs); //Use spread to copy from array in to the existing array.
    await campground.save();
    //Delete images
    if(req.body.deleteImages){ //If there are any images in the array deleteImages.
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {image: {filename: {$in: req.body.deleteImages} } } }) //Pull pulls image out from an array and checks if it an image with filename inside the array of deleted images.
    }
    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deletecampground = async (req,res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}