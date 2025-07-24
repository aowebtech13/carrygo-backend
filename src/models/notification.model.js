const mongoose = require('mongoose');
const { toJSON, paginate }= require('./plugins');

const schema = mongoose.Schema(
  {
    title: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        trim: true,
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
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
 * @typedef Notification
 */
const Notification = mongoose.model('Notification', schema);

module.exports = Notification;
