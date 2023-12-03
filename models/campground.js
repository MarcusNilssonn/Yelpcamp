const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema ({
    url: String,
    filename: String
});

//Creating a virtual property to do a calculation to view a small image (thumbnail)
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
})

const CampgroundSchema = new Schema({
    title: String,
    image: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    author: { //Author for comments/reviews
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
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