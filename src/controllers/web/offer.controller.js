/* eslint-disable prettier/prettier */
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const offerService = require('../../services/offer.service');

const respond = (res, message, data, code = httpStatus.OK) =>
  res.status(code).json({ status: true, code, message, data });

const getOffers = catchAsync(async (req, res) => respond(res, 'Offers retrieved successfully', await offerService.getOffers()));
const createOffer = catchAsync(async (req, res) => respond(res, 'Offer created successfully', await offerService.createOffer(req.body), httpStatus.CREATED));
const getOffer = catchAsync(async (req, res) => respond(res, 'Offer retrieved successfully', await offerService.getOffer(req.params.offerId)));
const updateOffer = catchAsync(async (req, res) => respond(res, 'Offer updated successfully', await offerService.updateOffer(req.params.offerId, req.body)));
const deleteOffer = catchAsync(async (req, res) => respond(res, 'Offer deleted successfully', await offerService.deleteOffer(req.params.offerId)));
const toggleOffer = catchAsync(async (req, res) => respond(res, 'Offer active state updated', await offerService.toggleOffer(req.params.offerId)));

module.exports = {
  getOffers,
  createOffer,
  getOffer,
  updateOffer,
  deleteOffer,
  toggleOffer,
};
