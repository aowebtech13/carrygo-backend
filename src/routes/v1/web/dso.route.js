const express = require('express');
const validate = require('../../../middlewares/validate');
const dsoValidation = require('../../../validations/dso.validation');
const dsoController = require('../../../controllers/web/dso.controller');
const { checkKey } = require('../../../middlewares/auth');
const { DsoRegistrationFields }  = require('../../../config/variables/config.variable');
const upload  = require('../../../utils/multer');

const router = express.Router();

router.get('/', checkKey, dsoController.getDSOs); 
router.get('/:dsoId', checkKey, validate(dsoValidation.getDSO), dsoController.getDSO);
router.get('/check/:email', checkKey, validate(dsoValidation.getDSOByEmail), dsoController.getDSOByEmail);
router.put('/update', checkKey, upload.fields(DsoRegistrationFields), dsoController.updateDSO); // validate(dsoValidation.updateDSO)
router.put('/update/status/:dsoId', checkKey, validate(dsoValidation.updateDSOStatus), dsoController.updateDSOStatus);
router.post('/create', checkKey, validate(dsoValidation.createDSO), dsoController.createDSO);

module.exports = router;