/* eslint-disable prettier/prettier */
const fs = require('fs');
const path = require('path');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const cloudinary = require('../utils/cloudinary');
const { Product } = require('../models');
const { findShop } = require('./shop.service');

/*
 * Shop product management for the web admin, ported from the mobile
 * backend's Laravel ProductAdminController (removed there).
 */

const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const iso = (date) => (date instanceof Date && !Number.isNaN(date.getTime()) ? date.toISOString() : null);

const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const randomSuffix = () => Math.random().toString(36).slice(2, 6).padEnd(4, '0');

/** Same shape as the mobile backend's ProductResource. */
const formatProduct = (product, shop) => {
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
  return {
    id: product._id.toString(),
    shopId: product.shopId,
    name: product.name,
    description: product.description,
    price: product.price,
    discountPrice: product.discountPrice,
    effectivePrice: product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price,
    hasDiscount,
    category: product.category,
    images: product.images,
    available: product.available,
    inStock: product.inStock,
    stockQuantity: product.stockQuantity,
    unit: product.unit,
    preparationTime: product.preparationTime,
    tags: product.tags,
    nutritionInfo: product.nutritionInfo,
    ingredients: product.ingredients,
    featured: product.featured,
    slug: product.slug,
    emoji: product.emoji,
    tone: product.tone,
    promo: product.promo,
    sauceOptions: product.sauceOptions || [],
    sizeOptions: product.sizeOptions || [],
    totalOrders: product.totalOrders,
    rating: product.rating,
    totalRatings: product.totalRatings,
    shop: shop ? { id: shop._id.toString(), name: shop.name, logo: shop.logo } : undefined,
    createdAt: iso(product.created_at),
    updatedAt: iso(product.updated_at),
  };
};

const removeTempFiles = (files) =>
  (files || []).forEach((file) => file && file.path && fs.unlink(file.path, () => {}));

/**
 * Checks and uploads multipart `images` to Cloudinary (folder "products").
 * @param {Array} files multer files
 * @returns {Promise<string[]>} secure URLs
 */
const uploadImages = async (files) => {
  if (!files || !files.length) return [];
  try {
    if (files.length > MAX_IMAGES) throw new ApiError(httpStatus.BAD_REQUEST, `You can upload at most ${MAX_IMAGES} images`);
    files.forEach((file) => {
      if (!IMAGE_EXTENSIONS.includes(path.extname(file.originalname).toLowerCase())) {
        throw new ApiError(httpStatus.BAD_REQUEST, `${file.originalname}: images must be JPG, JPEG or PNG`);
      }
      if (file.size > MAX_IMAGE_BYTES) throw new ApiError(httpStatus.BAD_REQUEST, `${file.originalname}: images must be 4MB or smaller`);
    });

    const uploads = await Promise.all(files.map((file) => cloudinary.uploader.upload(file.path, { folder: 'products' })));
    return uploads.map((upload) => upload.secure_url);
  } finally {
    removeTempFiles(files);
  }
};

const findProduct = async (shop, productId) => {
  const product = await Product.findOne({ _id: productId, shopId: shop._id.toString() });
  if (!product) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  return product;
};

const getProducts = async (shopId, query) => {
  const shop = (await findShop(shopId)).toObject();
  const where = { shopId: shop._id.toString() };
  if (query.available !== undefined) where.available = query.available;
  if (query.category) where.category = query.category;
  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), 'i');
    where.$or = [{ name: pattern }, { description: pattern }];
  }

  const limit = Math.min(parseInt(query.limit || query.per_page, 10) || 20, 100);
  const page = parseInt(query.page, 10) > 0 ? parseInt(query.page, 10) : 1;
  const [total, products] = await Promise.all([
    Product.countDocuments(where),
    Product.find(where).sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);

  return {
    products: products.map((product) => formatProduct(product)),
    pagination: { total, perPage: limit, currentPage: page, lastPage: Math.max(Math.ceil(total / limit), 1) },
  };
};

const createProduct = async (shopId, body, files) => {
  let shop;
  try {
    shop = await findShop(shopId);
  } catch (error) {
    removeTempFiles(files);
    throw error;
  }
  const images = await uploadImages(files);

  const product = await Product.create({
    available: true,
    inStock: true,
    stockQuantity: 0,
    preparationTime: shop.preparationTime,
    featured: false,
    totalOrders: 0,
    rating: 0,
    totalRatings: 0,
    ...body,
    shopId: shop._id.toString(),
    images,
    slug: `${slugify(body.name)}-${randomSuffix()}`,
  });

  return { product: formatProduct(product.toObject(), shop) };
};

const getProduct = async (shopId, productId) => {
  const shop = await findShop(shopId);
  const product = await findProduct(shop, productId);
  return { product: formatProduct(product.toObject(), shop) };
};

const updateProduct = async (shopId, productId, body, files) => {
  let shop;
  let product;
  try {
    shop = await findShop(shopId);
    product = await findProduct(shop, productId);

    const price = body.price !== undefined ? body.price : product.get('price');
    if (body.discountPrice !== undefined && body.discountPrice !== null && body.discountPrice >= price) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'discountPrice must be less than price');
    }
    const existingImages = product.get('images') || [];
    if (files && existingImages.length + files.length > MAX_IMAGES) {
      throw new ApiError(httpStatus.BAD_REQUEST, `A product can have at most ${MAX_IMAGES} images (it has ${existingImages.length})`);
    }
  } catch (error) {
    removeTempFiles(files);
    throw error;
  }

  // New uploads are appended to the existing images, as before
  const uploaded = await uploadImages(files);
  product.set(body);
  if (uploaded.length) product.set('images', [...(product.get('images') || []), ...uploaded]);
  await product.save();

  return { product: formatProduct(product.toObject(), shop) };
};

const deleteProduct = async (shopId, productId) => {
  const shop = await findShop(shopId);
  const product = await findProduct(shop, productId);
  await product.deleteOne();
  return {};
};

const toggleAvailability = async (shopId, productId) => {
  const shop = await findShop(shopId);
  const product = await findProduct(shop, productId);
  product.set('available', !product.get('available'));
  await product.save();
  return { available: product.get('available') };
};

const updateStock = async (shopId, productId, { stockQuantity, inStock }) => {
  const shop = await findShop(shopId);
  const product = await findProduct(shop, productId);
  product.set({ stockQuantity, inStock: inStock !== undefined ? inStock : stockQuantity > 0 });
  await product.save();
  return { stockQuantity: product.get('stockQuantity'), inStock: product.get('inStock') };
};

const bulkUpdateAvailability = async (shopId, { productIds, available }) => {
  const shop = await findShop(shopId);
  const result = await Product.updateMany(
    { _id: { $in: productIds }, shopId: shop._id.toString() },
    { $set: { available, updated_at: new Date() } }
  );
  return { updatedCount: result.nModified !== undefined ? result.nModified : result.modifiedCount };
};

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
