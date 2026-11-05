/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');

/**
 * ShopOrder documents are written by the mobile backend (Laravel). Only the fields
 * this backend queries are declared; strict: false keeps every other field
 * when reading and saving. Timestamps use Laravel's created_at / updated_at.
 */
const schema = mongoose.Schema(
  {
    shopId: { type: String, index: true },
    orderId: String,
    userId: String,
    totalAmount: Number,
  },
  {
    collection: 'shopOrders',
    strict: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

/**
 * @typedef ShopOrder
 */
const ShopOrder = mongoose.model('ShopOrder', schema);
module.exports = ShopOrder;
