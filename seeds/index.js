const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

//Connect and throw error if failed.
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true}) 
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
        const price = Math.floor(Math.random() *20)+10;
        const camp = new Campground({
            author: '6564b66be869833ebca768e7', //Setting all camps to have the/belong to same author.
            location: `${cities[random1000].city}, ${cities[random1000].state}`, //Put location to a random city and state from cities.
            title: `${sample(descriptors)} ${sample(places)}`,
            image: [
                {
                    url: 'https://res.cloudinary.com/dnzr2e8fz/image/upload/v1701596764/YelpCamp/ajxwvcutuylemuoakbog.jpg',
                    filename: 'YelpCamp/ajxwvcutuylemuoakbog'
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus rerum reiciendis pariatur incidunt asperiores qui atque enim nostrum, totam debitis fugiat delectus. Ipsum a laudantium esse est molestiae iste blanditiis!',
            price
        })
        await camp.save()
    }
}

seedDB().then(() => { //Run and then close.
    mongoose.connection.close();
});
