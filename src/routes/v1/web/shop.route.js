/* eslint-disable prettier/prettier */
const express = require('express');
const validate = require('../../../middlewares/validate');
const shopValidation = require('../../../validations/shop.validation');
const shopController = require('../../../controllers/web/shop.controller');
const productController = require('../../../controllers/web/product.controller');
const { checkKey } = require('../../../middlewares/auth');
const upload = require('../../../utils/multer');

// Vendor shops: approval, management, products and (read-only) orders.
// Moved here from the mobile backend's /api/v1/admin/shops routes.
const router = express.Router();
const images = upload.array('images', 5);

router.get('/', checkKey, validate(shopValidation.getShops), shopController.getShops);
router.get('/pending', checkKey, shopController.getPendingShops);

router.get('/:shopId', checkKey, validate(shopValidation.shopOnly), shopController.getShop);
router.put('/:shopId', checkKey, validate(shopValidation.updateShop), shopController.updateShop);
router.delete('/:shopId', checkKey, validate(shopValidation.shopOnly), shopController.deleteShop);
router.post('/:shopId/approve', checkKey, validate(shopValidation.shopOnly), shopController.approveShop);
router.post('/:shopId/reject', checkKey, validate(shopValidation.reason), shopController.rejectShop);
router.post('/:shopId/suspend', checkKey, validate(shopValidation.reason), shopController.suspendShop);
router.post('/:shopId/reactivate', checkKey, validate(shopValidation.shopOnly), shopController.reactivateShop);
router.post('/:shopId/toggle-status', checkKey, validate(shopValidation.shopOnly), shopController.toggleShopStatus);
router.get('/:shopId/statistics', checkKey, validate(shopValidation.shopOnly), shopController.getShopStatistics);
router.get('/:shopId/orders', checkKey, validate(shopValidation.getShopOrders), shopController.getShopOrders);
router.get('/:shopId/orders/:orderId', checkKey, validate(shopValidation.getShopOrder), shopController.getShopOrder);

router.get('/:shopId/products', checkKey, validate(shopValidation.getProducts), productController.getProducts);
router.post('/:shopId/products', checkKey, images, validate(shopValidation.createProduct), productController.createProduct);
router.post('/:shopId/products/bulk-update-availability', checkKey, validate(shopValidation.bulkUpdateAvailability), productController.bulkUpdateAvailability);
router.get('/:shopId/products/:productId', checkKey, validate(shopValidation.productOnly), productController.getProduct);
router.put('/:shopId/products/:productId', checkKey, images, validate(shopValidation.updateProduct), productController.updateProduct);
router.delete('/:shopId/products/:productId', checkKey, validate(shopValidation.productOnly), productController.deleteProduct);
router.post('/:shopId/products/:productId/toggle-availability', checkKey, validate(shopValidation.productOnly), productController.toggleAvailability);
router.post('/:shopId/products/:productId/update-stock', checkKey, validate(shopValidation.updateStock), productController.updateStock);

module.exports = router;
