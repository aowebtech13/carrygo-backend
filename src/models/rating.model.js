const mongoose = require('mongoose');
const { toJSON, paginate }= require('./plugins');

const schema = mongoose.Schema(
  {
    riderId: {
        type: Number,
        required: true,
    },
    customerId: {
        type: Number,
        required: true,
    },
    star: {
        type: Number,
        required: true,
    },
    comment: {
        type: String,
        trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
schema.plugin(toJSON);
schema.plugin(paginate);


/**
 * @typedef Rating
 */
const Rating = mongoose.model('Rating', schema);

module.exports = Rating;
