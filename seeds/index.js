const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

//Connect and throw error if failed.
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp') 
    .then(() => {
        console.log("Database connected")
    })
    .catch(err => {
        console.log("Error")
        console.log(err)
    })

const sample = array => array[Math.floor(Math.floor(Math.random() * array.length))] //Pass in the array to a function and return a random element from it.

const seedDB = async () => {
    await Campground.deleteMany({}); //Start with deleting everything.
    for(let i = 0; i< 50; i++){ //50 campgrounds.
        const random1000 = Math.floor(Math.random() * 1000) //1000 cities in the array. Choose a random one.
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`, //Put location to a random city and state from cities.
            title: `${sample(descriptors)} ${sample(places)}`
        })
        await camp.save()
    }
}

seedDB().then(() => { //Run and then close.
    mongoose.connection.close();
});
