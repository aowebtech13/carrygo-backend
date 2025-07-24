const express = require('express');
const validate = require('../../../middlewares/validate');
const orderValidation = require('../../../validations/order.validation');
const orderController = require('../../../controllers/web/order.controller');
const { checkKey } = require('../../../middlewares/auth');


const router = express.Router();

router.get('/', checkKey, validate(orderValidation.getOrders), orderController.getOrders);
router.get('/:trackingId', checkKey, validate(orderValidation.getOrderByTrackingId), orderController.getOrderByTrackingId);
router.post('/create', checkKey, orderController.createOrder);
router.put('/reassign', checkKey, validate(orderValidation.reassignRider), orderController.reassignRider);

module.exports = router;