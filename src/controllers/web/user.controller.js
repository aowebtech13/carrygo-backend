/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
const httpStatus = require('http-status');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { userService, emailService, cronService } = require('../../services');
const { formatData } = require('../../utils/extras');

cronService.startCronJob();

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['userType']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.findUsers(filter, options);
  res.status(httpStatus.OK).json({
    status: true,
    code: httpStatus.OK,
    message: 'Users retrieved successfully',
    data: result,
  });
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.status(httpStatus.CREATED).json({
    status: true,
    code: httpStatus.CREATED,
    message: 'User retrieved successfully',
    data: user,
  });
});

const getWallet = catchAsync(async (req, res) => {
  const user = await userService.getWallet(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  delete user._doc._id
  delete user._doc.__v
  delete user._doc.createdAt
  delete user._doc.updatedAt

  res.status(httpStatus.CREATED).json({
    status: true,
    code: httpStatus.CREATED,
    message: 'User wallet retrieved successfully',
    data: {...user._doc},
  });
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.status(httpStatus.OK).json({
    status: true,
    code: httpStatus.OK,
    message: 'User updated successfully',
    data: user,
  });
});

const updatePassword = catchAsync(async (req, res) => {
  const user = await userService.updatePassword(req.body);
  res.status(httpStatus.OK).json({
    status: true,
    code: httpStatus.OK,
    message: 'Password updated successfully',
    data: user,
  });
});

const logOut = catchAsync(async (req, res) => {
  req.logOut();
  res.status(httpStatus.OK).json({
    status: true,
    code: httpStatus.OK,
    message: 'User logged out successfully',
    data: {},
  });
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.OK).json({
    status: true,
    code: httpStatus.OK,
    message: 'User deleted successfully',
    data: {},
  });
});


const togglePaymentStatus = catchAsync(async (req, res) => {
  const data = await userService.togglePaymentStatus(req.body);
  if(!data) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  res.status(httpStatus.OK).json({
      status: true,
      code: httpStatus.OK,
      message: req.body.type === 'cash' 
      ? req.body.status ? 'Cash payment activated' : 'Cash payment deactivated' 
      : req.body.status ? 'Wallet payment activated' : 'Wallet payment deactivated',
      data,
  });
});

const toggleUserStatus = catchAsync(async (req, res) => {
  const data = await userService.toggleUserStatus(req.params.userId, req.params.status);
  if(!data) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  res.status(httpStatus.OK).json({
      status: true,
      code: httpStatus.OK,
      message: req.params.status === 'active' ? 'User activated' : 'User suspended',
      data,
  });
});

const isEmailExist = catchAsync(async (req, res) => {
  const data = await userService.isEmailExist(req.params.email);
  if(data) throw new ApiError(httpStatus.NOT_FOUND, 'Email already taken');
  res.status(httpStatus.OK).json({
      status: true,
      code: httpStatus.OK,
      message: 'Email available',
      data:{},
  });
});

const isPhoneExist = catchAsync(async (req, res) => {
  const data = await userService.isPhoneExist(req.params.phone);
  if(data) throw new ApiError(httpStatus.BAD_REQUEST, 'Phone already taken');
  res.status(httpStatus.OK).json({
      status: true,
      code: httpStatus.OK,
      message: 'Phone number available',
      data:{},
  });
})

const sendEmail = catchAsync(async (req, res) => {
  const {to, subject, message} = req.body;
  await emailService.sendEmail(to, subject, message)
  res.status(httpStatus.OK).json({
      status: true,
      code: httpStatus.OK,
      message: 'Email sent',
      data:{},
  });
});

const getPricePerKm = catchAsync(async (req, res) => {
  const data = await userService.getUserConfig(req.params.userId)
  if(!data) throw new ApiError(httpStatus.NOT_FOUND, 'Error fetching current price');
  res.status(httpStatus.OK).json({
      status: true,
      code: httpStatus.OK,
      message: 'Price retrieved', 
      data,
  });
});

const updatePricePerKm = catchAsync(async (req, res) => {
  const data = await userService.updatePricePerKm(req.params.userId,req.body)
  if(!data) throw new ApiError(httpStatus.NOT_FOUND, 'Error updating price per km');
  formatData(data)
  res.status(httpStatus.OK).json({
      status: true,
      code: httpStatus.OK,
      message: 'Price updated',
      data: {...data._doc},
  });
});

const addPromoCode = catchAsync(async (req, res) => {
  const data = await userService.addPromoCode(req.body)
  if(!data) throw new ApiError(httpStatus.NOT_FOUND, 'Error adding promo code');
  res.status(httpStatus.OK).json({
      status: true,
      code: httpStatus.OK,
      message: 'Promo code added',
      data,
  });
});

const getPromoCodes = catchAsync(async (req, res) => {
  const data = await userService.getPromoCodes(req.params.userId)
  if(!data) throw new ApiError(httpStatus.NOT_FOUND, 'Error fetching promo codes');
  res.status(httpStatus.OK).json({
      status: true,
      code: httpStatus.OK,
      message: 'Promo code retrieved',
      data,
  });
});

const deletePromoCode = catchAsync(async (req, res) => {
  const data = await userService.deletePromoCode(req.params.promoCode)
  if(!data) throw new ApiError(httpStatus.NOT_FOUND, 'Promo code not found');
  res.status(httpStatus.OK).json({
      status: true,
      code: httpStatus.OK,
      message: 'Promo code deleted',
      data,
  });
});

const addAdmin = catchAsync(async (req, res) => {
  console.log('about to add admin===>',req.body, req.file, req.headers);
  const result = await userService.addAdmin(req.body, req.file);
  res.status(httpStatus.OK).json({
    status: true,
    code: httpStatus.OK,
    message: 'Admin added successfully',
    data: result,
  });
});

const getAdmins = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.getAdmins(options);
  res.status(httpStatus.OK).json({
    status: true,
    code: httpStatus.OK, 
    message: 'Admin retrieve',
    data: result,
  });
});

const getAdmin = catchAsync(async (req, res) => {
  const result = await userService.getAdmin({_id: req.params.adminId});
  if(!result) throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  res.status(httpStatus.OK).json({
    status: true,
    code: httpStatus.OK, 
    message: 'Admin retrieve',
    data: result,
  });
});

const deleteAdmin = catchAsync(async (req, res) => {
  const result = await userService.deleteAdmin(req.params.adminId);
  if(!result) throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  res.status(httpStatus.OK).json({
    status: true,
    code: httpStatus.OK, 
    message: 'Admin deleted',
    data: {},
  });
});

// retreives carrygo admins
const getCarryGoAdmins = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.getCarryGoAdmins(options);
  res.status(httpStatus.OK).json({
    status: true,
    code: httpStatus.OK,
    message: 'Admin retrieve',
    data: result,
  });
});

const analytics = catchAsync(async (req, res) => {
  const result = await userService.analytics(req.params.userId);
  res.status(httpStatus.OK).json({
    status: true,
    code: httpStatus.OK,
    message: 'User anaylytics retrieve',
    data: result,
  });
});

module.exports = {
  addAdmin,
  analytics,
  getAdmins,
  getAdmin,
  deleteAdmin,
  getCarryGoAdmins,
  isPhoneExist,
  getPromoCodes,
  deletePromoCode,
  addPromoCode,
  getPricePerKm,
  togglePaymentStatus,
  sendEmail,
  getWallet,
  getUsers,
  getUser,
  updatePricePerKm,
  updateUser,
  deleteUser,
  updatePassword,
  toggleUserStatus,
  logOut,
  isEmailExist,
};
