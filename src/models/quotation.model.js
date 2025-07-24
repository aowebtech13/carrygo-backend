const mongoose = require('mongoose');
const { toJSON, paginate }= require('./plugins');

const schema = mongoose.Schema(
  {
    orderId: {
        type: String,
        required: true,
    },
    quotation: { 
        type: Number,
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
 * @typedef Quotation
 */
const Quotation = mongoose.model('Quotation', schema);

module.exports = Quotation;
