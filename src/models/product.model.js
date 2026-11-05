/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');

/**
 * Product documents are written by the mobile backend (Laravel). Only the fields
 * this backend queries are declared; strict: false keeps every other field
 * when reading and saving. Timestamps use Laravel's created_at / updated_at.
 */
const schema = mongoose.Schema(
  {
    shopId: { type: String, index: true },
    name: String,
    slug: String,
    price: Number,
    discountPrice: Number,
    category: String,
    images: [String],
    available: Boolean,
    inStock: Boolean,
    stockQuantity: Number,
  },
  {
    collection: 'products',
    strict: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

/**
 * @typedef Product
 */
const Product = mongoose.model('Product', schema);
module.exports = Product;
