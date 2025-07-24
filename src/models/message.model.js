const mongoose = require('mongoose');
const { toJSON, paginate }= require('./plugins');

const schema = mongoose.Schema(
  {
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        trim: true,
    },
    adminId: {
      type: String,
      required: true,
      trim: true,
    },
    customerId: {
      type: String,
      required: true,
      trim: true,
    },
    senderId: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    read: {
      type: Boolean,
      trim: true,
      default: false
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
 * @typedef Message
 */
const Message = mongoose.model('Message', schema);

module.exports = Message;
