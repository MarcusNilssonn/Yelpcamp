const mongoose = require('mongoose');
const { schema } = require('./campground');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number
})

module.exports = mongoose.model('Review', reviewSchema);