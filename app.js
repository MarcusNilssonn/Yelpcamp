const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
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

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', async (req, res) => { //Route for all campgrounds
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
})

app.get('/campgrounds/:id', async (req, res) => { //Route for each campground based on id.
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', {campground});
})


app.listen(3000, ()=> {
    console.log('Serving on port 3000')
})