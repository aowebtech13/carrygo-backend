/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const schema = mongoose.Schema(
  {
    userId: {
      type: String,
    },
    email: {
        type: String,
    },
    ipAddress: {
      type: String,
    },
    userType: {
      type: String,
    },
    dateLoggedIn: {
      type: Date,
      default: new Date(0),
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
schema.plugin(toJSON);

/**
 * @typedef LoggedInAdmin
 */
const LoggedInAdmin = mongoose.model('LoggedInAdmin', schema);
module.exports = LoggedInAdmin;
