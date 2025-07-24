const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const schema = mongoose.Schema(
  {
      userId: {
        type: String,
      },
      pricePerKm: {
        type: Number,
        default: 2650
      },
      packageType: {
        type: String,
        default: "haulage",
      },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
schema.plugin(toJSON);

/**
 * @typedef UserConfig
 */
const UserConfig = mongoose.model('UserConfig', schema);

module.exports = UserConfig;
