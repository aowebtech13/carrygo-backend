/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const schema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    discountPercentage: {
        type: Number,
        required: true,
    },
    promoCode: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
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
 * @typedef PromoCode
 */
const PromoCode = mongoose.model('PromoCode', schema);
module.exports = PromoCode;
