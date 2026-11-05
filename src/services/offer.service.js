/* eslint-disable prettier/prettier */
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Offer } = require('../models');

/*
 * Platform offers (customer-app promo cards) for the web admin, ported from
 * the mobile backend's Laravel OfferAdminController (removed there).
 */

const iso = (date) => (date instanceof Date && !Number.isNaN(date.getTime()) ? date.toISOString() : null);

const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Same shape as the mobile backend's OfferAdminResource. */
const formatOffer = (offer) => ({
  id: offer._id.toString(),
  slug: offer.slug,
  title: offer.title,
  description: offer.description,
  emoji: offer.emoji,
  image: offer.image,
  href: offer.href,
  cardTone: offer.cardTone,
  tileTone: offer.tileTone,
  active: !!offer.active,
  order: offer.order,
  startsAt: iso(offer.startsAt),
  endsAt: iso(offer.endsAt),
  createdAt: iso(offer.created_at),
  updatedAt: iso(offer.updated_at),
});

const findOffer = async (offerId) => {
  const offer = await Offer.findById(offerId);
  if (!offer) throw new ApiError(httpStatus.NOT_FOUND, 'Offer not found');
  return offer;
};

const getOffers = async () => {
  const offers = await Offer.find({}).sort({ order: 1, created_at: -1 }).lean();
  return { offers: offers.map(formatOffer) };
};

const createOffer = async (body) => {
  const slug = body.slug || `${slugify(body.title)}-${Math.random().toString(36).slice(2, 6).padEnd(4, '0')}`;
  const offer = await Offer.create({ ...body, slug });
  return { offer: formatOffer(offer.toObject()) };
};

const getOffer = async (offerId) => ({ offer: formatOffer((await findOffer(offerId)).toObject()) });

const updateOffer = async (offerId, body) => {
  const offer = await findOffer(offerId);
  offer.set(body);
  await offer.save();
  return { offer: formatOffer(offer.toObject()) };
};

const deleteOffer = async (offerId) => {
  const offer = await findOffer(offerId);
  await offer.deleteOne();
  return {};
};

const toggleOffer = async (offerId) => {
  const offer = await findOffer(offerId);
  offer.active = !offer.active;
  await offer.save();
  return { offer: formatOffer(offer.toObject()) };
};

module.exports = {
  getOffers,
  createOffer,
  getOffer,
  updateOffer,
  deleteOffer,
  toggleOffer,
};
