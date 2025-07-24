/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const schema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    lastLng: {
        type: Number,
        required: true
    },
    lastLat: {
      type: Number,
      required: true
    },
    online: {
      type: Boolean,
      default: false
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
schema.plugin(toJSON);

/**
 * @typedef RiderLocation
 */
const RiderLocation = mongoose.model('riderLocation', schema, 'riderLocations');
module.exports = RiderLocation;
