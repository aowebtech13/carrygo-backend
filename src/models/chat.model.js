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
    lastMessage: {
        type: String,
        required: true,
        trim: true,
    },
    dateCreated: {
        type: Date,
        default: Date.now(),
    },
    lastMessagePostedAt: {
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
 * @typedef Chat
 */
const Chat = mongoose.model('Chat', schema);

module.exports = Chat;
