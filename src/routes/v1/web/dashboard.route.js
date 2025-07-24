const express = require('express');
const validate = require('../../../middlewares/validate');
const {checkPrivileges} = require('../../../middlewares/privilege');
const dashboardValidation = require('../../../validations/dashboard.validation');
const dashboardController = require('../../../controllers/web/dashboard.controller');
const { checkKey } = require('../../../middlewares/auth');

const router = express.Router();

router.get('/orders', checkKey, validate(dashboardValidation.getOrders), dashboardController.getOrders);
router.get('/charts/:adminId', checkPrivileges('dashboard'), checkKey, validate(dashboardValidation.getCharts), dashboardController.getCharts);
router.get('/income/:adminId', checkPrivileges('sales report'), checkKey, dashboardController.totalIncome);

module.exports = router;