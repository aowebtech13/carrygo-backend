const Joi = require('joi');
const { objectId } = require('./custom.validation');

const addReview = {
  body: Joi.object().keys({
    username: Joi.string().required(),
    userimage: Joi.string().allow(null, ''),
    state: Joi.string().required(),
    country: Joi.string().required(),
    comment: Joi.string().required(),
    star: Joi.number()
  }),
};

const getReview = {
  params: Joi.object().keys({
    reviewId: Joi.string().custom(objectId),
  }),
};

const updateReview = {
  params: Joi.object().keys({
    reviewId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
        username: Joi.string().allow(null, ''),
        userimage: Joi.string().allow(null, ''),
        state: Joi.string().allow(null, ''),
        country: Joi.string().allow(null, ''),
        comment: Joi.string().allow(null, ''),
        star: Joi.number().allow(null, ''),
    })
    .min(1),
};

const deleteReview = {
  params: Joi.object().keys({
    reviewId: Joi.string().custom(objectId),
  }),
};


module.exports = {
    addReview,
    getReview,
    updateReview,
    deleteReview
};
