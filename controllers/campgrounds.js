const Campground = require('../models/campground');

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
    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deletecampground = async (req,res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}