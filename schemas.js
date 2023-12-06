const BaseJoi = require('joi');

const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({ //Defining extension on joi.string().
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, { //sanitizehtml will sanitize html.
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value }) //If something was removed from the input.
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

module.exports.campgroundSchema = Joi.object({//Define a schema (not related to mongoose)
    //Set some rules.
    campground: Joi.object({ //Has to be an object and required.
        title: Joi.string().required().escapeHTML(), //title has to be string and is required.
        price: Joi.number().required().min(0), //Price needs to be minimum 0.
        //image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required() ,
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body:Joi.string().required().escapeHTML()
    }).required()
})