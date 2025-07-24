/* eslint-disable prettier/prettier */
const express = require('express');
const validate = require('../../../middlewares/validate');
const userValidation = require('../../../validations/user.validation');
const userController = require('../../../controllers/mobile/user.controller');
const { checkKey } = require('../../../middlewares/auth');


const router = express.Router();

// just a test route
// fire on my brother
router.get('/:userId', checkKey, validate(userValidation.getUser), userController.getUser);


module.exports = router;