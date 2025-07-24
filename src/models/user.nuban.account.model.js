/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const schema = mongoose.Schema(
  {
    email: {
        type: String,
        required: true,
    },
    bank: {
      name: {type: String},
      id: {type: String},
      slug: {type: String},
    },
    accountName: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    currency: {
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
 * @typedef NubanAccount
 */
const NubanAccount = mongoose.model('NubanAccount', schema);
module.exports = NubanAccount;
