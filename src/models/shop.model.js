/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');

/**
 * Shop documents are written by the mobile backend (Laravel). Only the fields
 * this backend queries are declared; strict: false keeps every other field
 * when reading and saving. Timestamps use Laravel's created_at / updated_at.
 */
const schema = mongoose.Schema(
  {
    name: String,
    slug: String,
    status: String,
    shopType: String,
    email: String,
    phoneNumber: String,
    isOpen: Boolean,
  },
  {
    collection: 'shops',
    strict: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

/**
 * @typedef Shop
 */
const Shop = mongoose.model('Shop', schema);
module.exports = Shop;
