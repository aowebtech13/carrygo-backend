/* eslint-disable no-console */
const express = require('express');
const validate = require('../../../middlewares/validate');
const riderValidation = require('../../../validations/rider.validation');
const riderController = require('../../../controllers/web/rider.controller');
const upload  = require('../../../utils/multer');
const { /* RiderRegistrationFields, */ DsoCarrierRegistrationFields }  = require('../../../config/variables/config.variable');
const { checkKey } = require('../../../middlewares/auth');  

const router = express.Router();

router.get('/', checkKey, riderController.getRiders);
router.get('/:riderId', checkKey, validate(riderValidation.getRider), riderController.getRider); 
router.get('/orders/:riderId', checkKey, validate(riderValidation.getRider), riderController.getRiderOrders);
router.get('/available/:lat/:long', checkKey, validate(riderValidation.availableRiders), riderController.availableRiders);
router.get('/check/:email', checkKey, validate(riderValidation.getRiderByEmail), riderController.getRiderByEmail);
router.put('/update', checkKey, upload.fields(DsoCarrierRegistrationFields), riderController.updateRider); // validate(riderValidation.updateRider),
router.put('/update/status/:riderId', checkKey, validate(riderValidation.updateRiderStatus), riderController.updateRiderStatus);
router.post('/create', checkKey, validate(riderValidation.createHpRider), riderController.createHpRider);
router.post('/dso/create', checkKey, validate(riderValidation.createDsoRider), riderController.createDsoRider);

module.exports = router;