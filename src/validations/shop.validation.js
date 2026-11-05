/* eslint-disable prettier/prettier */
const Joi = require('joi');
const { objectId } = require('./custom.validation');

const shopParams = { shopId: Joi.string().required().custom(objectId) };
const productParams = { ...shopParams, productId: Joi.string().required().custom(objectId) };
const pageQuery = {
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  per_page: Joi.number().integer().min(1).max(100),
};

// ---------------------------------------------------------------- shops

const getShops = {
  query: Joi.object().keys({
    ...pageQuery,
    status: Joi.string().valid('pending', 'active', 'inactive', 'suspended', 'rejected'),
    shopType: Joi.string(),
    search: Joi.string().allow(''),
  }),
};

const shopOnly = { params: Joi.object().keys(shopParams) };

const reason = {
  params: Joi.object().keys(shopParams),
  body: Joi.object().keys({ reason: Joi.string().trim().max(500).required() }),
};

const updateShop = {
  params: Joi.object().keys(shopParams),
  body: Joi.object()
    .keys({
      name: Joi.string().max(255),
      description: Joi.string().allow(''),
      address: Joi.string(),
      phoneNumber: Joi.string(),
      email: Joi.string().email(),
      deliveryRadius: Joi.number().min(1),
      minOrder: Joi.number().min(0),
      deliveryFee: Joi.number().min(0),
      preparationTime: Joi.number().integer().min(5),
      operatingHours: Joi.alternatives().try(Joi.object(), Joi.array()),
    })
    .min(1),
};

const getShopOrders = {
  params: Joi.object().keys(shopParams),
  query: Joi.object().keys({ ...pageQuery, status: Joi.string() }),
};

const getShopOrder = {
  params: Joi.object().keys({ ...shopParams, orderId: Joi.string().required().custom(objectId) }),
};

// ------------------------------------------------------------- products

const sizeOption = Joi.object().keys({ label: Joi.string().required(), delta: Joi.number().required() });

// Multipart forms send everything as strings - Joi converts numbers/booleans,
// and .single() accepts one value where an array is expected
const productFields = {
  name: Joi.string().max(255),
  description: Joi.string(),
  price: Joi.number().min(0),
  discountPrice: Joi.number().min(0).allow(null),
  category: Joi.string(),
  available: Joi.boolean(),
  inStock: Joi.boolean(),
  stockQuantity: Joi.number().integer().min(0).allow(null),
  unit: Joi.string().max(50),
  preparationTime: Joi.number().integer().min(1).allow(null),
  tags: Joi.array().items(Joi.string()).single().allow(null),
  nutritionInfo: Joi.object().allow(null),
  ingredients: Joi.array().items(Joi.string()).single().allow(null),
  featured: Joi.boolean(),
  emoji: Joi.string().max(16).allow(null, ''),
  tone: Joi.string().max(64).allow(null, ''),
  promo: Joi.string().max(255).allow(null, ''),
  sauceOptions: Joi.array().items(Joi.string()).single().allow(null),
  sizeOptions: Joi.array().items(sizeOption).single().allow(null),
};

const getProducts = {
  params: Joi.object().keys(shopParams),
  query: Joi.object().keys({ ...pageQuery, available: Joi.boolean(), category: Joi.string(), search: Joi.string().allow('') }),
};

const createProduct = {
  params: Joi.object().keys(shopParams),
  body: Joi.object().keys({
    ...productFields,
    name: productFields.name.required(),
    description: productFields.description.required(),
    price: productFields.price.required(),
    discountPrice: Joi.number().min(0).less(Joi.ref('price')).allow(null),
    category: productFields.category.required(),
    unit: productFields.unit.required(),
  }),
};

const productOnly = { params: Joi.object().keys(productParams) };

const updateProduct = {
  params: Joi.object().keys(productParams),
  // Empty body is fine when only new images are uploaded
  body: Joi.object().keys(productFields),
};

const updateStock = {
  params: Joi.object().keys(productParams),
  body: Joi.object().keys({
    stockQuantity: Joi.number().integer().min(0).required(),
    inStock: Joi.boolean(),
  }),
};

const bulkUpdateAvailability = {
  params: Joi.object().keys(shopParams),
  body: Joi.object().keys({
    productIds: Joi.array().items(Joi.string().custom(objectId)).min(1).required(),
    available: Joi.boolean().required(),
  }),
};

module.exports = {
  getShops,
  shopOnly,
  reason,
  updateShop,
  getShopOrders,
  getShopOrder,
  getProducts,
  createProduct,
  productOnly,
  updateProduct,
  updateStock,
  bulkUpdateAvailability,
};
