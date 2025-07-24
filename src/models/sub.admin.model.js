/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const schema = mongoose.Schema(
  {
    adminId: {
      type: String,
      required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    accountType: {
      type: String,
      required: true,
  },
    privileges: {
      type: Array,
      lowercase: true,
      default: [],
  }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
schema.plugin(toJSON);

/**
 * @typedef SubAdmin
 */
const SubAdmin = mongoose.model('SubAdmin', schema);
module.exports = SubAdmin;
