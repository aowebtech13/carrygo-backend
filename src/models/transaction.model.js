/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const moment = require('moment');
const { toJSON, paginate } = require('./plugins');

const schema = mongoose.Schema(
  {
    userId: {
        type: String,
        required: true,
    },
    recieverName: {
        type: String,
        required: true,
    },
    accountNumber: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    bankName: {
        type: String,
        required: true,
    },
    reference: {
        type: String,
        required: true,
    },
    txRef: {
        type: String,
    },
    source: {
        type: String,
    },
    companyCut: {
        type: Number,
        default: 0
    },
    riderCut: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        default: 'transfer',
        required: true,
    },
    amount: {
        type: Number,
        trim: true,
    },
    status: {
        type: String,
        default: 'success',
        trim: true,
    },
    dateCreated: {
        type: Date,
        default: moment().add(1, 'hours'),
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
schema.plugin(toJSON);
schema.plugin(paginate);

/**
 * @typedef Transaction
 */
const Transaction = mongoose.model('Transaction', schema);
module.exports = Transaction;
