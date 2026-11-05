/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');

/**
 * ShopRating documents are written by the mobile backend (Laravel). Only the fields
 * this backend queries are declared; strict: false keeps every other field
 * when reading and saving. Timestamps use Laravel's created_at / updated_at.
 */
const schema = mongoose.Schema(
  {
    shopId: String,
    userId: String,
    rating: Number,
  },
  {
    collection: 'shopRatings',
    strict: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

/**
 * @typedef ShopRating
 */
const ShopRating = mongoose.model('ShopRating', schema);
module.exports = ShopRating;
