const mongoose = require('mongoose');
const { toJSON, paginate }= require('./plugins');

const schema = mongoose.Schema(
  {
    orderId: {
        type: String,
        required: true,
    },
    items: { 
        type: String,
        required: true,
    },
    note: {
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
schema.plugin(paginate);


/**
 * @typedef BuyForMeOrder
 */
const BuyForMe = mongoose.model('buyForMeOrders', schema, 'buyForMeOrders');
module.exports = BuyForMe;
