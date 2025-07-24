const mongoose = require('mongoose');
const { toJSON, paginate }= require('./plugins');

const schema = mongoose.Schema(
  {
    orderId: {
        type: String,
        required: true,
    },
    itemDescription: { 
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
 * @typedef PackageOrder
 */
const PackageOrder = mongoose.model('PackageOrder', schema, 'packageOrders');

module.exports = PackageOrder;
