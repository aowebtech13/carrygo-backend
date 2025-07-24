const express = require('express');
const extrasController = require('../../../controllers/web/extras.controller');
const { checkKey } = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const userValidation = require('../../../validations/user.validation');

const router = express.Router();

router.post('/upload', checkKey, extrasController.uploadDoc);
router.get('/countries', checkKey, extrasController.getCountries);
router.post('/subscribe', checkKey, validate(userValidation.subscribe), extrasController.subscribe);
router.get('/subscribers', checkKey, extrasController.getSubscribers);
router.get('/downloads', checkKey, extrasController.appStoreData); 
router.post('/feedback', checkKey, validate(userValidation.sendFeedback), extrasController.sendFeedback);
// router.get('/generate/ids', checkKey, extrasController.generateUniqueId);

module.exports = router;