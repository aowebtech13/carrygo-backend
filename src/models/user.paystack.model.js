/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const schema = mongoose.Schema(
  {
    email: {
        type: String,
        required: true,
    },
    customerId: {
      type: String,
      required: true,
    },
    customerCode: {
      type: String,
      required: true,
  },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
schema.plugin(toJSON);

/**
 * @typedef PaystackUsers
 */
const PaystackUsers = mongoose.model('PaystackUsers', schema);
module.exports = PaystackUsers;
