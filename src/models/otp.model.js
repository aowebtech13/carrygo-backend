/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const schema = mongoose.Schema(
  {
    mobileNumber: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
        index: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    blacklisted: {
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

/**
 * @typedef OTP
 */
const OTP = mongoose.model('OTP', schema);
module.exports = OTP;
