/* eslint-disable prettier/prettier */
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const productService = require('../../services/product.service');

const respond = (res, message, data, code = httpStatus.OK) =>
  res.status(code).json({ status: true, code, message, data });

const getProducts = catchAsync(async (req, res) => respond(res, 'Products retrieved successfully', await productService.getProducts(req.params.shopId, req.query)));
const createProduct = catchAsync(async (req, res) => respond(res, 'Product created successfully', await productService.createProduct(req.params.shopId, req.body, req.files), httpStatus.CREATED));
const getProduct = catchAsync(async (req, res) => respond(res, 'Product retrieved successfully', await productService.getProduct(req.params.shopId, req.params.productId)));
const updateProduct = catchAsync(async (req, res) => respond(res, 'Product updated successfully', await productService.updateProduct(req.params.shopId, req.params.productId, req.body, req.files)));
const deleteProduct = catchAsync(async (req, res) => respond(res, 'Product deleted successfully', await productService.deleteProduct(req.params.shopId, req.params.productId)));
const toggleAvailability = catchAsync(async (req, res) => respond(res, 'Product availability updated', await productService.toggleAvailability(req.params.shopId, req.params.productId)));
const updateStock = catchAsync(async (req, res) => respond(res, 'Product stock updated', await productService.updateStock(req.params.shopId, req.params.productId, req.body)));
const bulkUpdateAvailability = catchAsync(async (req, res) => respond(res, 'Products availability updated', await productService.bulkUpdateAvailability(req.params.shopId, req.body)));

module.exports = {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  toggleAvailability,
  updateStock,
  bulkUpdateAvailability,
};
