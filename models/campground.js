const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: [String],
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            //ObjectId from the review model.
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

CampgroundSchema.post('findOneAndDelete', async function (doc) { //doc has been deleted and has been passed to the middleware function.
    if(doc){ //If something was found and deleted.
        await Review.deleteMany({
            _id: {
                $in: doc.reviews //Delete every review that was in the deleted doc (campgrounds) array.
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);