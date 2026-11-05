/* eslint-disable prettier/prettier */
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const { Shop, ShopOwner, ShopOrder, ShopRating, Product, Order, User } = require('../models');
const emailService = require('./email.service');

/*
 * Shop management for the web admin. Ported from the mobile backend's
 * Laravel Admin/* controllers (ShopApprovalController, ShopAdminController,
 * OrderManagementController::getOrderDetails), which were removed there.
 * Order state changes (accept/reject/prepare/ready) stay in the vendor portal
 * on the mobile backend - they drive rider broadcast, refunds and notifications.
 */

const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const iso = (date) => (date instanceof Date && !Number.isNaN(date.getTime()) ? date.toISOString() : null);
const idOf = (doc) => (doc && doc._id ? doc._id.toString() : null);

const pageOptions = (query, defaultLimit) => {
  const limit = Math.min(parseInt(query.limit || query.per_page, 10) || defaultLimit, 100);
  const page = parseInt(query.page, 10) > 0 ? parseInt(query.page, 10) : 1;
  return { limit, page, skip: (page - 1) * limit };
};

const pagination = (total, { limit, page }) => ({
  total,
  perPage: limit,
  currentPage: page,
  lastPage: Math.max(Math.ceil(total / limit), 1),
});

/**
 * The shop's owner as a user: ShopOwner (role owner) -> users collection.
 * @param {string} shopId
 * @returns {Promise<Object|null>} lean user
 */
const getShopOwnerUser = async (shopId) => {
  const owner = await ShopOwner.findOne({ shopId: String(shopId), role: 'owner' }).lean();
  if (!owner || !owner.userId) return null;
  return User.findById(owner.userId).lean().catch(() => null);
};

const formatOwner = (user) => ({
  id: idOf(user),
  name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
  email: user ? user.email || null : null,
  phone: user ? user.phone || null : null,
});

/** Same shape as the mobile backend's ShopResource. */
const formatShop = (shop) => ({
  id: idOf(shop),
  slug: shop.slug,
  name: shop.name,
  description: shop.description,
  shopType: shop.shopType,
  cuisineTypes: shop.cuisineTypes,
  address: shop.address,
  location: { lat: shop.lat, lng: shop.lng },
  deliveryRadius: shop.deliveryRadius,
  operatingHours: shop.operatingHours,
  images: shop.images,
  coverImage: shop.coverImage,
  logo: shop.logo,
  rating: shop.rating,
  totalOrders: shop.totalOrders,
  totalRatings: shop.totalRatings,
  status: shop.status,
  featured: shop.featured,
  categories: shop.categories,
  deliveryTime: shop.deliveryTime,
  minOrder: shop.minOrder,
  deliveryFee: shop.deliveryFee,
  preparationTime: shop.preparationTime,
  phoneNumber: shop.phoneNumber,
  email: shop.email,
  isVerified: shop.isVerified,
  tags: shop.tags,
  isOpen: shop.isOpen,
  emoji: shop.emoji,
  tone: shop.tone,
  opensAtLabel: shop.opensAtLabel,
  deal: shop.deal,
  categorySlugs: shop.categorySlugs || [],
  rejectionReason: shop.rejectionReason || null,
  suspensionReason: shop.suspensionReason || null,
  approvedAt: iso(shop.approvedAt),
  suspendedAt: iso(shop.suspendedAt),
  createdAt: iso(shop.created_at),
  updatedAt: iso(shop.updated_at),
});

const findShop = async (shopId) => {
  const shop = await Shop.findById(shopId);
  if (!shop) throw new ApiError(httpStatus.NOT_FOUND, 'Shop not found');
  return shop;
};

// Emails never fail the admin action - the status change is what matters
const notifyOwner = (shop, subject, text, html) => {
  getShopOwnerUser(shop._id)
    .then((owner) => {
      if (!owner || !owner.email) {
        logger.warn(`[shop-admin] no owner email for shop ${shop._id}, "${subject}" not sent`);
        return null;
      }
      const name = `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || 'there';
      return emailService.sendEmail(owner.email, subject, text(name), html(name));
    })
    .catch((error) => logger.error(`[shop-admin] "${subject}" email for shop ${shop._id} failed: ${error.message}`));
};

const escapeHtml = (text) =>
  String(text || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const list = (items) => `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;

// ---------------------------------------------------------------- approval

const getShops = async (filter, query) => {
  const where = {};
  if (filter.status) where.status = filter.status;
  if (filter.shopType) where.shopType = filter.shopType;
  if (filter.search) {
    const pattern = new RegExp(escapeRegex(filter.search), 'i');
    where.$or = [{ name: pattern }, { email: pattern }, { phoneNumber: pattern }];
  }

  const options = pageOptions(query, 20);
  const [total, shops] = await Promise.all([
    Shop.countDocuments(where),
    Shop.find(where).sort({ created_at: -1 }).skip(options.skip).limit(options.limit).lean(),
  ]);

  const results = await Promise.all(
    shops.map(async (shop) => ({ ...formatShop(shop), owner: formatOwner(await getShopOwnerUser(shop._id)) }))
  );

  return { shops: results, pagination: pagination(total, options) };
};

const getPendingShops = async () => {
  const shops = await Shop.find({ status: 'pending' }).sort({ created_at: -1 }).lean();
  const results = await Promise.all(
    shops.map(async (shop) => ({
      id: idOf(shop),
      name: shop.name,
      shopType: shop.shopType,
      description: shop.description,
      address: shop.address,
      phoneNumber: shop.phoneNumber,
      email: shop.email,
      status: shop.status,
      createdAt: iso(shop.created_at),
      owner: formatOwner(await getShopOwnerUser(shop._id)),
    }))
  );
  return { shops: results, total: results.length };
};

const requireStatus = (shop, expected, action) => {
  if (shop.status !== expected) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Only ${expected} shops can be ${action}. Current status: ${shop.status}`);
  }
};

const approveShop = async (shopId) => {
  const shop = await findShop(shopId);
  requireStatus(shop, 'pending', 'approved');

  shop.set({ status: 'active', isOpen: true, approvedAt: new Date(), rejectionReason: null });
  await shop.save();

  const shopName = escapeHtml(shop.name);
  notifyOwner(
    shop,
    'Congratulations! Your Shop Has Been Approved',
    (name) =>
      `Hi ${name},\n\nCongratulations! Your shop ${shop.name} has been approved and is now live on CarryGo.\n\nYou can now add and manage your products, accept and process orders, view analytics and reports, and update your shop settings. Log in to your vendor dashboard to get started!\n\nShop ID: ${shop._id}\n\nBest regards,\nThe CarryGo Team`,
    (name) =>
      `<h2>🎉 Shop Approved!</h2><p>Hi ${escapeHtml(name)},</p><p>Congratulations! We're excited to inform you that your shop <strong>${shopName}</strong> has been approved and is now live on our platform!</p><p>You can now:</p>${list([
        'Add and manage your products',
        'Accept and process orders',
        'View analytics and reports',
        'Update shop settings',
      ])}<p>Log in to your vendor dashboard to get started!</p><p>Shop ID: ${shop._id}</p><p>If you have any questions, feel free to contact our support team.</p><p>Best regards,<br>The CarryGo Team</p>`
  );

  return { shop: formatShop(shop.toObject()) };
};

const rejectShop = async (shopId, reason) => {
  const shop = await findShop(shopId);
  requireStatus(shop, 'pending', 'rejected');

  shop.set({ status: 'rejected', rejectionReason: reason, isOpen: false });
  await shop.save();

  notifyOwner(
    shop,
    'Shop Application Update - Action Required',
    (name) =>
      `Hi ${name},\n\nThank you for your interest in joining CarryGo. After reviewing your shop application for ${shop.name}, we are unable to approve it at this time.\n\nReason: ${reason}\n\nPlease address the issues above and submit a new application, or contact our support team if you need clarification.\n\nBest regards,\nThe CarryGo Team`,
    (name) =>
      `<h2>Shop Application Update</h2><p>Hi ${escapeHtml(name)},</p><p>Thank you for your interest in joining our platform. After reviewing your shop application for <strong>${escapeHtml(shop.name)}</strong>, we regret to inform you that we are unable to approve it at this time.</p><p><strong>Reason for rejection:</strong><br>${escapeHtml(reason)}</p><p>What you can do:</p>${list([
        'Review the reason provided above',
        'Address the issues mentioned',
        'Submit a new application with the necessary corrections',
        'Contact our support team if you need clarification',
      ])}<p>We appreciate your understanding and look forward to the possibility of working with you in the future.</p><p>Best regards,<br>The CarryGo Team</p>`
  );

  return { shop: formatShop(shop.toObject()) };
};

const suspendShop = async (shopId, reason) => {
  const shop = await findShop(shopId);
  requireStatus(shop, 'active', 'suspended');

  shop.set({ status: 'suspended', isOpen: false, suspensionReason: reason, suspendedAt: new Date() });
  await shop.save();

  notifyOwner(
    shop,
    'Important: Your Shop Has Been Suspended',
    (name) =>
      `Hi ${name},\n\nYour shop ${shop.name} has been temporarily suspended from CarryGo.\n\nReason: ${reason}\n\nYour shop is no longer visible to customers and cannot accept new orders; existing orders must still be completed. Please contact support@carrygo.org to discuss reactivation.\n\nBest regards,\nThe CarryGo Team`,
    (name) =>
      `<h2>⚠️ Shop Suspended</h2><p>Hi ${escapeHtml(name)},</p><p>We regret to inform you that your shop <strong>${escapeHtml(shop.name)}</strong> has been temporarily suspended from our platform.</p><p><strong>Reason for suspension:</strong><br>${escapeHtml(reason)}</p><p>What this means:</p>${list([
        'Your shop is no longer visible to customers',
        'You cannot accept new orders',
        'Existing orders must be completed',
        'Your dashboard access is limited',
      ])}<p>Next steps:</p>${list([
        'Review the reason for suspension carefully',
        'Contact our support team immediately to discuss the issue',
        'Take corrective action as advised',
        'Request reactivation once issues are resolved',
      ])}<p>Please contact our support team at support@carrygo.org or reply to this email for assistance.</p><p>Best regards,<br>The CarryGo Team</p>`
  );

  return { shop: formatShop(shop.toObject()) };
};

const reactivateShop = async (shopId) => {
  const shop = await findShop(shopId);
  requireStatus(shop, 'suspended', 'reactivated');

  shop.set({ status: 'active', isOpen: true, suspensionReason: null, suspendedAt: null });
  await shop.save();

  return { shop: formatShop(shop.toObject()) };
};

const deleteShop = async (shopId) => {
  const shop = await findShop(shopId);
  const id = shop._id.toString();

  if (await ShopOrder.exists({ shopId: id })) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot delete a shop that has orders. Suspend it instead to preserve order history.'
    );
  }

  await Promise.all([
    ShopOwner.deleteMany({ shopId: id }),
    Product.deleteMany({ shopId: id }),
    ShopRating.deleteMany({ shopId: id }),
  ]);
  await shop.deleteOne();

  return {};
};

// ------------------------------------------------------------- management

const getShop = async (shopId) => {
  const shop = await findShop(shopId);
  return { shop: { ...formatShop(shop.toObject()), owner: formatOwner(await getShopOwnerUser(shop._id)) } };
};

const updateShop = async (shopId, body) => {
  const shop = await findShop(shopId);
  shop.set(body);
  await shop.save();
  return { shop: formatShop(shop.toObject()) };
};

const toggleShopStatus = async (shopId) => {
  const shop = await findShop(shopId);
  if (shop.status !== 'active' && shop.status !== 'inactive') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Only active or inactive shops can be toggled. Current status: ${shop.status} - use approve/reactivate instead.`
    );
  }
  shop.status = shop.status === 'active' ? 'inactive' : 'active';
  await shop.save();
  return { status: shop.status };
};

// ------------------------------------------------------------------ orders

const deliveryAddressText = (order) => {
  const address = order && order.deliveryAddress;
  if (!address) return null;
  if (typeof address === 'string') return address;
  if (Array.isArray(address)) return address.map((stop) => (stop && stop.address) || stop).filter(Boolean).join(', ') || null;
  return address.address || null;
};

/** Same shape as the mobile backend's ShopOrderResource. */
const formatShopOrder = (shopOrder, order, shop, customer) => ({
  id: idOf(shopOrder),
  orderId: shopOrder.orderId,
  shopId: shopOrder.shopId,
  userId: shopOrder.userId,
  status: order ? order.status : null,
  trackingNumber: order ? order.trackingNumber : null,
  paymentMethod: order ? order.paymentMethod : null,
  cancelReason: shopOrder.cancelReason,
  items: shopOrder.items,
  subtotal: shopOrder.subtotal,
  deliveryFee: shopOrder.deliveryFee,
  totalAmount: shopOrder.totalAmount,
  specialInstructions: shopOrder.specialInstructions,
  estimatedPreparationTime: shopOrder.estimatedPreparationTime,
  shopAcceptedAt: iso(shopOrder.shopAcceptedAt),
  preparationStartedAt: iso(shopOrder.preparationStartedAt),
  readyForPickupAt: iso(shopOrder.readyForPickupAt),
  riderId: shopOrder.riderId,
  deliveryStatus: shopOrder.deliveryStatus,
  riderAssignedAt: iso(shopOrder.riderAssignedAt),
  pickedUpAt: iso(shopOrder.pickedUpAt),
  deliveredAt: iso(shopOrder.deliveredAt),
  shop: shop
    ? { id: idOf(shop), name: shop.name, logo: shop.logo, address: shop.address, phoneNumber: shop.phoneNumber }
    : undefined,
  customer: customer
    ? {
        id: idOf(customer),
        name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
        phone: customer.phone,
      }
    : undefined,
  delivery: order
    ? { address: deliveryAddressText(order), lat: order.deliveryLat, lng: order.deliveryLng }
    : undefined,
  createdAt: iso(shopOrder.created_at),
  updatedAt: iso(shopOrder.updated_at),
});

const byId = (docs) => new Map(docs.map((doc) => [doc._id.toString(), doc]));
const validIds = (ids) => [...new Set(ids.filter((id) => /^[0-9a-fA-F]{24}$/.test(String(id || ''))).map(String))];

/** Order ids (as strings) of this shop's orders whose Order.status matches. */
const orderIdsWithStatus = async (shopId, status) => {
  const orderIds = await ShopOrder.distinct('orderId', { shopId });
  const orders = await Order.find({ _id: { $in: validIds(orderIds) }, status }).select('_id').lean();
  return orders.map((order) => order._id.toString());
};

const getShopOrders = async (shopId, query) => {
  const shop = (await findShop(shopId)).toObject();
  const id = shop._id.toString();

  const where = { shopId: id };
  if (query.status) where.orderId = { $in: await orderIdsWithStatus(id, query.status) };

  const options = pageOptions(query, 15);
  const [total, shopOrders] = await Promise.all([
    ShopOrder.countDocuments(where),
    ShopOrder.find(where).sort({ created_at: -1 }).skip(options.skip).limit(options.limit).lean(),
  ]);

  const [orders, customers] = await Promise.all([
    Order.find({ _id: { $in: validIds(shopOrders.map((o) => o.orderId)) } }).lean(),
    User.find({ _id: { $in: validIds(shopOrders.map((o) => o.userId)) } }).lean(),
  ]);
  const orderMap = byId(orders);
  const customerMap = byId(customers);

  return {
    orders: shopOrders.map((o) => formatShopOrder(o, orderMap.get(String(o.orderId)), shop, customerMap.get(String(o.userId)))),
    pagination: pagination(total, options),
  };
};

/** {orderId} may be the ShopOrder id or the main Order id. */
const getShopOrder = async (shopId, orderId) => {
  const shop = (await findShop(shopId)).toObject();
  const id = shop._id.toString();

  const shopOrder = await ShopOrder.findOne({ shopId: id, $or: [{ _id: orderId }, { orderId: String(orderId) }] }).lean();
  if (!shopOrder) throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');

  const [order, customer] = await Promise.all([
    validIds([shopOrder.orderId]).length ? Order.findById(shopOrder.orderId).lean() : null,
    validIds([shopOrder.userId]).length ? User.findById(shopOrder.userId).lean() : null,
  ]);

  return { order: formatShopOrder(shopOrder, order, shop, customer) };
};

const getShopStatistics = async (shopId) => {
  const shop = (await findShop(shopId)).toObject();
  const id = shop._id.toString();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [totalOrders, pendingIds, completedIds, todayOrders] = await Promise.all([
    ShopOrder.countDocuments({ shopId: id }),
    orderIdsWithStatus(id, 'pending'),
    // The mobile backend marks delivered orders 'completed' (the Laravel stats
    // looked for 'delivered', which never occurs, so revenue was always 0)
    orderIdsWithStatus(id, 'completed'),
    ShopOrder.countDocuments({ shopId: id, created_at: { $gte: startOfToday } }),
  ]);

  const revenue = await ShopOrder.aggregate([
    { $match: { shopId: id, orderId: { $in: completedIds } } },
    { $group: { _id: null, total: { $sum: { $toDouble: { $ifNull: ['$totalAmount', 0] } } } } },
  ]);

  return {
    totalOrders,
    pendingOrders: pendingIds.length,
    totalRevenue: revenue.length ? Math.round(revenue[0].total * 100) / 100 : 0,
    todayOrders,
    rating: shop.rating,
    totalRatings: shop.totalRatings,
  };
};

module.exports = {
  findShop,
  getShops,
  getPendingShops,
  approveShop,
  rejectShop,
  suspendShop,
  reactivateShop,
  deleteShop,
  getShop,
  updateShop,
  toggleShopStatus,
  getShopOrders,
  getShopOrder,
  getShopStatistics,
};
