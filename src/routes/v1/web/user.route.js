const express = require('express');
const {auth} = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const userValidation = require('../../../validations/user.validation');
const userController = require('../../../controllers/web/user.controller');
const { checkPrivileges } = require('../../../middlewares/privilege');
const upload  = require('../../../utils/multer');


const router = express.Router();

router.get('/admin', auth(''), userController.getAdmins);
router.get('/admin/:adminId', auth(''), validate(userValidation.getAdmin), userController.getAdmin);
router.delete('/admin/:adminId', auth(''), validate(userValidation.deleteAdmin), userController.deleteAdmin);
router.get('/s/admins', userController.getCarryGoAdmins); // no auth 
router.get('/analytics/:userId', auth(''),  validate(userValidation.analytics), userController.analytics);
router.post('/admin/add', auth(''), upload.single('image'), checkPrivileges('manage admin'), userController.addAdmin);

router.get('/wallet/:userId', validate(userValidation.getWallet), userController.getWallet);
router.put('/payment/toggle', validate(userValidation.togglePaymentStatus), userController.togglePaymentStatus);
router.get('/status/:userId/:status', validate(userValidation.toggleUserStatus), userController.toggleUserStatus);

router
.route('/')
.get(validate(userValidation.getUsers), userController.getUsers);

router
  .route('/:userId')
  .get(validate(userValidation.getUser), userController.getUser)
  .put(validate(userValidation.updateUser), userController.updateUser);
  // .delete(validate(userValidation.deleteUser), userController.deleteUser);
  
router.put('/password/update', validate(userValidation.updatePassword), userController.updatePassword);
router.post('/logout/:userId', validate(userValidation.logOut), userController.logOut);
router.post('/email/send', validate(userValidation.sendEmail), userController.sendEmail);
router.get('/email/check/:email', validate(userValidation.isEmailExist), userController.isEmailExist);
router.get('/phone/check/:phone', validate(userValidation.isPhoneExist), userController.isPhoneExist);
router.get('/config/price/:userId', checkPrivileges('configuration'), validate(userValidation.getPricePerKm), userController.getPricePerKm);
router.put('/config/price/:userId', checkPrivileges('configuration'), validate(userValidation.updatePricePerKm), userController.updatePricePerKm);

router.get('/config/promo/:userId', checkPrivileges('configuration'), validate(userValidation.getPromoCodes), userController.getPromoCodes);
router.post('/config/promo/', checkPrivileges('configuration'), validate(userValidation.addPromoCode), userController.addPromoCode);
router.delete('/config/promo/:promoCode', validate(userValidation.deletePromoCode), userController.deletePromoCode);

module.exports = router;