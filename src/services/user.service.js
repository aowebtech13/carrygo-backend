/* eslint-disable no-use-before-define */
/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
const ID = require("nodejs-unique-numeric-id-generator");
const httpStatus = require('http-status');
const { User, Wallet, PaystackUsers, UserConfig, PromoCode, SubAdmin, Feedback, Newsletter } = require('../models');
const Order = require('../models/order.model');
const ApiError = require('../utils/ApiError');
const cloudinary = require('../utils/cloudinary');
const { paginate, sort } = require('../utils/extras');
// const { sendEmailToAdmin } = require('./email.service');
const { checkUniqueId } = require('./extras.service');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  userBody.userType = 'admin';
  userBody.firstName = userBody.name;
  userBody.lastName = 'Admin';
  const user = await User.create(userBody);
  Wallet.create({userId: user.id}) // creates admin wallet 
  addConfig({userId: user.id}) // initialise admin configs
  return user;
};

const addAdmin = async (userBody,file) => {
  if (await User.isEmailTaken(userBody.email)) throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  const admin = await User.findById(userBody.adminId)
  
  if (!admin) throw new ApiError(httpStatus.BAD_REQUEST, 'Admin not found');
  if(admin.userType !== "admin") throw new ApiError(httpStatus.UNAUTHORIZED, 'You cannot perform this action');

  let image;
  if(file) image = await uploadDoc(file.path,['sud-admin-profile']);
  console.log('image',image);

  const uniqueId = await checkUniqueId(ID.generate(new Date().toJSON()));
  userBody.uniqueId = uniqueId

  userBody.userType = 'sub-admin';
  userBody.avatar = image ? image.url : ''
  userBody.avatarId = image ? image.public_id : ''
  // await sendEmailToAdmin(userBody.email,userBody.firstName)
  const user = await User.create(userBody);
  userBody.userId = user.id
  Wallet.create({userId: user.id}) // creates admin wallet
  addConfig({userId: user.id,packageType: 'haulage'}) // initialise admin configs 'haulage
  addConfig({userId: user.id,packageType:'bookARide'}) // bookARide
  addConfig({userId: user.id,packageType:'buyForMe'}) // buyForMe
  addConfig({userId: user.id,packageType:'sendAPackage'}) // sendAPackage 
  addConfig({userId: user.id,packageType:'deduction'}) // deduction 
  await createSubAdmin(userBody);
  return user
};
 
const createSubAdmin = async (payload) => {
  return SubAdmin.create(payload);
};

const getAdmins = async (options) => {
  const users = await User.find({userType: 'sub-admin'});
  const admins = await users.map(async user =>{
    const data = await SubAdmin.findOne({userId: user.id})
    if(data){
      const {accountType,privileges}  = data;
      return {
        ...user._doc,
        accountType,privileges
      }
    }
    return '';
  })

  const adminUsers = await Promise.all(admins).then(docs => {return docs;})
  if(options.sortBy){
      const sorted = sort(adminUsers,options.sortBy, options.order || '');
      return paginate(sorted,options);;
  }
  return paginate(adminUsers,options);
};

const getAdmin = async (filter) => {
  console.log('filter',filter)
  const user = await User.findOne(filter);
  if(!user) return null
  const data = await SubAdmin.findOne({userId: user.id})
  if(data){
    const {accountType,privileges}  = data;
    return {
      ...user._doc,
      accountType,privileges
    }
  }
  
  return data;
};

const deleteAdmin = async (_id) => {
  const admin = await User.findById(_id);
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }
  await admin.remove();
  await SubAdmin.deleteOne({userId:_id});
  return admin
};

const getCarryGoAdmins = async (options) => {
  return User.paginate({userType: 'admin'},options);
};

const uploadDoc = async (imageString,tags) => {
  try {
    if(imageString){
        const imageUrl = await cloudinary.uploader.upload(imageString,
            {
              upload_preset: 'CarryGoFiles',
              tags,
            }
        ).then(fileUploaded => {
          // eslint-disable-next-line no-console
          return fileUploaded;
        })
        .catch(error =>{
          // eslint-disable-next-line no-console
          console.log("error oooo",error);
          throw new ApiError(httpStatus.NOT_FOUND, `Error uploading profile`);
        })
      
        return imageUrl;
    }
    return '';
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("error man=>",error);
    throw new ApiError(httpStatus.NOT_FOUND, 'Error uploading image');
  }
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  filter.status = {$nin: ["deleted"]};
  const users = await User.paginate(filter, options);
  return users;
};

const findUsers = async (filter) => {
  filter.status = {$nin: ["deleted"]};
  const users = await User.find({...filter});
  return {
    results: users,
    totalResults: users.length
  };
};

const getWallet = async (userId) => {
  return Wallet.findOne({$or: [{userId},{accountNumber:userId}]});
};

const getWalletByAccountNumber = async (accountNumber) => {
  return Wallet.findOne({accountNumber});
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const updateUser = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  updateBody.name = `${updateBody.firstname || ''} ${updateBody.lastname || ''}`;
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Update user password
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
 const updatePassword = async (updateBody) => {
  const user = await getUserById(updateBody.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!(await user.isPasswordMatch(updateBody.oldPassword))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Old password mismatch');
  }
 
  Object.assign(user, {password: updateBody.newPassword});
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  Object.assign(user, {status: 'deleted'});
  await user.save();
  return user;
};

const togglePaymentStatus = async (updateBody) => {
  const { userId, type, status} = updateBody
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if(type === 'cash') Object.assign(user, {cashPayment: status});
  else Object.assign(user, {walletPayment: status});
  await user.save();
  return user;
};

const toggleUserStatus = async (userId,status) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  Object.assign(user, {status});
  await user.save();
  return user;
};

const addCustomer = async (payload) => {
  return PaystackUsers.create(payload)
};

const getCustomer = async (email) => {
  return PaystackUsers.findOne({email});
};

const addConfig = async (payload) => {
  return UserConfig.create(payload);
};

const getUserConfig = async (userId) => {
  return UserConfig.find({userId});
};

const getUserConfigWithPackage = async (userId,packageType) => {
  return UserConfig.findOne({userId,packageType});
};

const updatePricePerKm = async (userId,payload) => {
  const { pricePerKm, packageType } = payload
  const user = await getUserById(userId);
  if(user.userType === 'sub-admin'){
    console.log('na sub admin');
    const admin = await SubAdmin.findOne({userId})
    console.log(admin)
    userId = admin.adminId
  }
  const userConfig = await getUserConfigWithPackage(userId,packageType);
  if (!userConfig) {
    return addConfig({userId,pricePerKm,packageType});
  }
  Object.assign(userConfig, {pricePerKm});
  await userConfig.save();
  return userConfig;
};

const addPromoCode = async (payload) => {
  const promoCode = await getPromoCode(payload.promoCode)
  if(promoCode){
    if(promoCode.toLowerCase === payload.promoCode.toLowerCase()) throw new ApiError(httpStatus.BAD_REQUEST, 'Promo code already exist')
    throw new ApiError(httpStatus.BAD_REQUEST, 'Promo code already exist')
  } 
  return PromoCode.create(payload);
};

const getPromoCode = async (promoCode) => {
  return PromoCode.findOne({promoCode});
};

const getPromoCodes = async (userId) => {
  return PromoCode.find({userId});
};

const getAllPromoCodes = async () => {
  return PromoCode.find();
};

const deletePromoCode = async (promoCode) => {
  const promo = await getPromoCode(promoCode);
  if (!promo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Promo code not found');
  }
  await promo.remove();
  return promo;
};

const sendFeedback = async (payload) => {
  return Feedback.create(payload);
};

const subscribe = async (payload) => {
  return Newsletter.create(payload);
};

const getSubscribers = async (fitler,option) => {
  return Newsletter.paginate(fitler,option);
};

const analytics = async(userId) =>{
    const orders = await Order.find({userId, status: {$nin: ['canceled']}})
    const wallet = await Wallet.find({userId})
    const canceledOrders = await Order.find({userId, status:'canceled'})

    return {
      totalOrders: orders.length,
      totalCanceledOrders: canceledOrders.length,
      balance: wallet.balance || 0
    }
}

const isEmailExist = async (email) => {
  return User.findOne({ email, status: {$nin: ['deleted','incomplete']}});
};

const isPhoneExist = async (phone) => {
  phone = phone.startsWith('0')
   ? `+234${phone.slice(1)}` 
   : phone;
  return User.findOne({ phone, status: {$nin: ['deleted','incomplete']}});
};

module.exports = {
  sendFeedback,
  isEmailExist,
  isPhoneExist,
  analytics,
  getSubscribers,
  subscribe,
  addAdmin,
  getWalletByAccountNumber,
  getAllPromoCodes,
  addPromoCode,
  getAdmins,
  getAdmin,
  getPromoCodes,
  deletePromoCode,
  addCustomer,
  getCustomer,
  createUser,
  updatePricePerKm,
  getUserConfig,
  queryUsers,
  findUsers,
  getUserById,
  getWallet,
  updateUser,
  addConfig,
  getUserByEmail,
  updatePassword,
  getCarryGoAdmins,
  deleteAdmin,
  updateUserById,
  deleteUserById,
  toggleUserStatus,
  togglePaymentStatus,
};
