const express = require('express');
const validate = require('../../../middlewares/validate');
const reviewValidation = require('../../../validations/review.validation');
const reviewController = require('../../../controllers/web/review.controller');
const { checkKey } = require('../../../middlewares/auth');


const router = express.Router();

router.post('/add', checkKey, validate(reviewValidation.addReview), reviewController.addReview);
router.get('/', checkKey, reviewController.getReviews);
router.get('/:reviewId', checkKey, validate(reviewValidation.getReview), reviewController.getReview);
router.put('/update/:reviewId', checkKey, validate(reviewValidation.updateReview), reviewController.updateReview);
router.delete('/delete/:reviewId', checkKey, validate(reviewValidation.deleteReview), reviewController.deleteReview);

module.exports = router;