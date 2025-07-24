const mongoose = require('mongoose');
const { toJSON, paginate }= require('./plugins');

const schema = mongoose.Schema(
  {
    userId: {
        type: String,
        required: true,
        trim: true,
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
    orderType: { // (haulage, package, buyForMe, bookARide)
        type: String,
        trim: true,
    },
    currentPackageLng: {
      type: Number,
      trim: true,
    },
    currentPackageLat: {
      type: Number,
      trim: true,
    },
    orderCost: {
      type: String,
      trim: true,
    },
    riderId: {
      type: String,
      trim: true,
      default: '',
    },
    itemDescription: {
      type: String,
      trim: true,
      default: '',
    },
    itemImageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    itemsList: {
      type: String,
      trim: true,
      default: '',
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    pickupAddress: {
        type: String,
        trim: true,
    },
    deliveryAddress: [],
    pickupLat: {
      type: String,
      trim: true,
    },
    deliveryLat: [],
    deliveryLng: [],
    receiverName: {
      type: String,
      trim: true,
    },
    receiverNumber: {
      type: String,
      trim: true,
    },
    modeOfPayment: { // (wallet, card, cash)
      type: String,
      trim: true,
    },
    status: { // (processing, accepted, picked, delivered, canceled)
        type: String,
        default: 'processing',
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
 * @typedef Order
 */
const Order = mongoose.model('Order', schema);

module.exports = Order;
