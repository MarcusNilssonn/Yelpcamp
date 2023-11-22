const Joi = require('joi');

module.exports.campgroundSchema = Joi.object({//Define a schema (not related to mongoose)
    //Set some rules.
    campground: Joi.object({ //Has to be an object and required.
        title: Joi.string().required(), //title has to be string and is required.
        price: Joi.number().required().min(0), //Price needs to be minimum 0.
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required() 
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body:Joi.string().required()
    }).required()
})