const express = require('express');
const validate = require('../../../middlewares/validate');
const requestValidation = require('../../../validations/request.validation');
const requestController = require('../../../controllers/web/request.controller');
const { checkKey } = require('../../../middlewares/auth');

const router = express.Router();

router.get('/:adminId', checkKey, validate(requestValidation.getRequests), requestController.getRequests);
router.get('/info/:orderId', checkKey, validate(requestValidation.getRequest), requestController.getRequest);
router.put('/update/:orderId', checkKey, validate(requestValidation.updateRequestStatus), requestController.updateRequestStatus);
router.post('/quotation', checkKey, validate(requestValidation.sendQuotation), requestController.sendQuotation);

module.exports = router;