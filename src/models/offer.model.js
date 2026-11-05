/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');

/**
 * Offer documents are written by the mobile backend (Laravel). Only the fields
 * this backend queries are declared; strict: false keeps every other field
 * when reading and saving. Timestamps use Laravel's created_at / updated_at.
 */
const schema = mongoose.Schema(
  {
    slug: String,
    title: String,
    active: Boolean,
    order: Number,
    startsAt: Date,
    endsAt: Date,
  },
  {
    collection: 'offers',
    strict: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

/**
 * @typedef Offer
 */
const Offer = mongoose.model('Offer', schema);
module.exports = Offer;
