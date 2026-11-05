/* eslint-disable prettier/prettier */
const Joi = require('joi');
const { objectId } = require('./custom.validation');

const offerFields = {
  title: Joi.string().max(255),
  slug: Joi.string().max(255).allow(null, ''),
  description: Joi.string().allow(null, ''),
  emoji: Joi.string().max(16).allow(null, ''),
  image: Joi.string().allow(null, ''),
  href: Joi.string().allow(null, ''),
  cardTone: Joi.string().max(64).allow(null, ''),
  tileTone: Joi.string().max(64).allow(null, ''),
  active: Joi.boolean(),
  order: Joi.number().integer().allow(null),
  startsAt: Joi.date().allow(null),
  endsAt: Joi.date().allow(null),
};

const offerParams = Joi.object().keys({ offerId: Joi.string().required().custom(objectId) });

const createOffer = {
  body: Joi.object().keys({ ...offerFields, title: offerFields.title.required() }),
};

const offerOnly = { params: offerParams };

const updateOffer = {
  params: offerParams,
  body: Joi.object().keys(offerFields).min(1),
};

module.exports = {
  createOffer,
  offerOnly,
  updateOffer,
};
