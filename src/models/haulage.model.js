const mongoose = require('mongoose');
const { toJSON, paginate }= require('./plugins');

const schema = mongoose.Schema(
  {
    orderId: {
        type: String,
        required: true,
    },
    itemName: { 
        type: String,
    },
    weight: {
        type: String,
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
 * @typedef HaulageOrder
 */
const Haulage = mongoose.model('haulageOrders', schema, 'haulageOrders');
module.exports = Haulage;
