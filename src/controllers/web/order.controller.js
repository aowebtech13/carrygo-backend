const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const pick = require('../../utils/pick');

const { orderService } = require('../../services');

const createOrder = catchAsync(async (req, res) => {
  const order = await orderService.createOrder(req.body);
  res.status(httpStatus.CREATED).json({
    status: true,
    code: httpStatus.CREATED,
    message: 'Order created successfully',
    data: order,
  });
});

const getOrders = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page','startDate','endDate']);
    const orders = await orderService.getOrders({},options);
    res.status(httpStatus.CREATED).json({
      status: true,
      code: httpStatus.CREATED,
      message: 'Orders retreived successfully',
      data: orders,
    });
});

const reassignRider = catchAsync(async (req, res) => {
  const orders = await orderService.reassignRider(req.body);
  res.status(httpStatus.CREATED).json({
    status: true,
    code: httpStatus.CREATED,
    message: 'Rider reassigned successfully',
    data: orders,
  });
});

const getOrderByTrackingId = catchAsync(async (req, res) => {
  const order = await orderService.getOrderByTrackingId(req.params.trackingId);
  res.status(httpStatus.CREATED).json({
    status: true,
    code: httpStatus.CREATED,
    message: 'Order retreived successfully',
    data: order,
  });
});

module.exports = {
    createOrder,
    getOrders,
    reassignRider,
    getOrderByTrackingId
};
