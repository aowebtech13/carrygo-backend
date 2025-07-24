const express = require('express');
const validate = require('../../../middlewares/validate');
const authValidation = require('../../../validations/auth.validation');
const authController = require('../../../controllers/web/auth.controller');
const { checkKey } = require('../../../middlewares/auth');

const router = express.Router();

router.post('/register', checkKey, validate(authValidation.register), authController.register);
router.post('/login', checkKey, validate(authValidation.login), authController.login);

router.post('/otp/send', checkKey, validate(authValidation.sendOtp), authController.sendOtp);
router.post('/otp/verify', checkKey, validate(authValidation.verifyOtp), authController.verifyOtp);

// extras that might be needed in the future
router.post('/logout', checkKey, validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', checkKey, validate(authValidation.refreshTokens), authController.refreshTokens);
router.post('/forgot-password', checkKey, validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/reset-password', checkKey, validate(authValidation.resetPassword), authController.resetPassword);

router.post('/otp/email/send', validate(authValidation.sendOtpEmail), authController.sendOtpEmail);
router.post('/otp/email/verify', validate(authValidation.verifyOtpEmail), authController.verifyOtpEmail);

router.post('/verify-email', checkKey, validate(authValidation.verifyEmail), authController.verifyEmail);

module.exports = router;