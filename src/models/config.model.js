const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const schema = mongoose.Schema(
  {
    base_fare: {
      type: Number,
    },
    package_type: {
        type: String,
      },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
schema.plugin(toJSON);

/**
 * @typedef Config
 */
const Config = mongoose.model('Config', schema);

module.exports = Config;
