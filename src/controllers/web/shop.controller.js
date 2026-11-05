/* eslint-disable prettier/prettier */
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const shopService = require('../../services/shop.service');

const respond = (res, message, data, code = httpStatus.OK) =>
  res.status(code).json({ status: true, code, message, data });

const getShops = catchAsync(async (req, res) => respond(res, 'Shops retrieved successfully', await shopService.getShops(req.query, req.query)));
const getPendingShops = catchAsync(async (req, res) => respond(res, 'Pending shops retrieved successfully', await shopService.getPendingShops()));
const getShop = catchAsync(async (req, res) => respond(res, 'Shop retrieved successfully', await shopService.getShop(req.params.shopId)));
const updateShop = catchAsync(async (req, res) => respond(res, 'Shop updated successfully', await shopService.updateShop(req.params.shopId, req.body)));
const deleteShop = catchAsync(async (req, res) => respond(res, 'Shop deleted successfully', await shopService.deleteShop(req.params.shopId)));
const approveShop = catchAsync(async (req, res) => respond(res, 'Shop approved successfully. The owner has been notified by email.', await shopService.approveShop(req.params.shopId)));
const rejectShop = catchAsync(async (req, res) => respond(res, 'Shop rejected. The owner has been notified by email.', await shopService.rejectShop(req.params.shopId, req.body.reason)));
const suspendShop = catchAsync(async (req, res) => respond(res, 'Shop suspended. The owner has been notified by email.', await shopService.suspendShop(req.params.shopId, req.body.reason)));
const reactivateShop = catchAsync(async (req, res) => respond(res, 'Shop reactivated successfully', await shopService.reactivateShop(req.params.shopId)));
const toggleShopStatus = catchAsync(async (req, res) => respond(res, 'Shop status updated', await shopService.toggleShopStatus(req.params.shopId)));
const getShopOrders = catchAsync(async (req, res) => respond(res, 'Shop orders retrieved successfully', await shopService.getShopOrders(req.params.shopId, req.query)));
const getShopOrder = catchAsync(async (req, res) => respond(res, 'Order retrieved successfully', await shopService.getShopOrder(req.params.shopId, req.params.orderId)));
const getShopStatistics = catchAsync(async (req, res) => respond(res, 'Shop statistics retrieved successfully', await shopService.getShopStatistics(req.params.shopId)));

module.exports = {
  getShops,
  getPendingShops,
  getShop,
  updateShop,
  deleteShop,
  approveShop,
  rejectShop,
  suspendShop,
  reactivateShop,
  toggleShopStatus,
  getShopOrders,
  getShopOrder,
  getShopStatistics,
};
