/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const schema = mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    riderId: {
        type: String,
        required: true
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
schema.plugin(toJSON);

/**
 * @typedef OrderRider
 */
const OrderRider = mongoose.model('orderRider', schema, 'orderRiders');
module.exports = OrderRider;
