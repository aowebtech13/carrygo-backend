const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const Review = require('../models/review.model')

/**
 * Add Review
 * @param {Object} requestBody
 * @returns {Promise<User>}
 */
 const addReview = async (requestBody) => {
    return Review.create(requestBody);
  };

/**
 * Get Reviews
 * @param {object} body
 * @returns {String}
 */
const getReviews = async (filter,options) => {
    const reviews = await Review.paginate(filter,options);
    return reviews;
};

 /**
* Get review
* @param {string} reviewId
* @returns {Promise<User>}
*/
const getReview = async (reviewId) => {
   const review = await Review.findById(reviewId);
    if(!review){
        throw new ApiError(httpStatus.NOT_FOUND, 'Review Not found');
    }
    return review;
 };

 /**
 * Update review
 * @param {ObjectId} reviewId
 * @param {Object} requestBody
 * @returns {Promise<User>}
 */
const updateReview = async (reviewId, requestBody) => {
    const review = await getReview(reviewId);
    if (!review) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
    }
    Object.assign(review, requestBody);
    await review.save();
    return review;
};

/**
 * Delete review
 * @param {ObjectId} reviewId
 * @returns {Promise<User>}
 */
 const deleteReview = async (reviewId) => {
    const review = await getReview(reviewId);
    if (!review) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
    }
    await review.remove();
    return review;
};


module.exports = {
    addReview,
    getReviews,
    getReview,
    updateReview,
    deleteReview
};
