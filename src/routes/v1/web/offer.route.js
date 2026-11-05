/* eslint-disable prettier/prettier */
const express = require('express');
const validate = require('../../../middlewares/validate');
const offerValidation = require('../../../validations/offer.validation');
const offerController = require('../../../controllers/web/offer.controller');
const { checkKey } = require('../../../middlewares/auth');

// Customer-app promo offers. Moved here from the mobile backend's /api/v1/admin/offers routes.
const router = express.Router();

router.get('/', checkKey, offerController.getOffers);
router.post('/', checkKey, validate(offerValidation.createOffer), offerController.createOffer);
router.get('/:offerId', checkKey, validate(offerValidation.offerOnly), offerController.getOffer);
router.put('/:offerId', checkKey, validate(offerValidation.updateOffer), offerController.updateOffer);
router.delete('/:offerId', checkKey, validate(offerValidation.offerOnly), offerController.deleteOffer);
router.post('/:offerId/toggle-active', checkKey, validate(offerValidation.offerOnly), offerController.toggleOffer);

module.exports = router;
