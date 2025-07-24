const mongoose = require('mongoose');
const { toJSON, paginate }= require('./plugins');

const schema = mongoose.Schema(
  {
    username: {
        type: String,
        required: true,
    },
    userimage: { 
        type: String,
        required: true,
    },
    state: { 
        type: String,
        required: true,
    },
    country: { 
        type: String,
        required: true,
    },
    comment: { 
        type: String,
        required: true,
    },
    star: { 
        type: Number,
        required: true,
    },
    datePosted: { 
        type: Date,
        default: Date.now(),
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
 * @typedef Review
 */
const Review = mongoose.model('Review', schema);

module.exports = Review;
