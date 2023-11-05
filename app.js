const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
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

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: true})); //Parse the body.
app.use(methodOverride('_method')); //Pass in the string to be used for query-string.

app.get('/', (req, res) => {
    res.render('home')
});

app.get('/campgrounds', async (req, res) => { //Route for all campgrounds
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
});

//Important to place before app.get id since order matters.
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});



app.get('/campgrounds/:id', async (req, res) => { //Route for each campground based on id.
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', {campground});
});

app.post('/campgrounds', async(req, res) => { //Where the form is submitted to.
    const campground = new Campground(req.body.campground); //Create new campground with our submitted form/data.
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`) //Redirect to new id page.
})

app.get('/campgrounds/:id/edit', async (req,res) => {
    const campground = await Campground.findById(req.params.id) //look up a campgrounds based on the id.
    res.render('campgrounds/edit', {campground});
})

//PUT-route to update.
app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params; //Gives the id.
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
})

//Delete-route to delete.
app.delete('/campgrounds/:id', async (req,res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

app.listen(3000, ()=> {
    console.log('Serving on port 3000')
});