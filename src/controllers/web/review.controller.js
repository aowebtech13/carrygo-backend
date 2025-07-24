const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const pick = require('../../utils/pick');

const { reviewService } = require('../../services');

const addReview = catchAsync(async (req, res) => {
  const user = await reviewService.addReview(req.body);
  res.status(httpStatus.CREATED).json({
    status: true,
    code: httpStatus.CREATED,
    message: 'Review added successfully',
    data: user,
  });
});

const getReviews = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const orders = await reviewService.getReviews({},options);
    res.status(httpStatus.CREATED).json({
      status: true,
      code: httpStatus.CREATED,
      message: 'Reviews retreived successfully',
      data: orders,
    });
});

const getReview = catchAsync(async (req, res) => {
  const order = await reviewService.getReview(req.params.reviewId);
  res.status(httpStatus.CREATED).json({
    status: true,
    code: httpStatus.CREATED,
    message: 'Review retreived successfully',
    data: order,
  });
});

const updateReview = catchAsync(async (req, res) => {
    const user = await reviewService.updateReview(req.params.reviewId, req.body);
    res.status(httpStatus.CREATED).json({
      status: true,
      code: httpStatus.CREATED,
      message: 'Review updated successfully',
      data: user,
    });
});

const deleteReview = catchAsync(async (req, res) => {
    const order = await reviewService.deleteReview(req.params.reviewId);
    res.status(httpStatus.CREATED).json({
      status: true,
      code: httpStatus.CREATED,
      message: 'Review deleted successfully',
      data: order,
    });
});

module.exports = {
    addReview,
    getReviews,
    getReview,
    updateReview,
    deleteReview,
};
