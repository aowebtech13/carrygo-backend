const Joi = require('joi');
const { objectId, password } = require('./custom.validation');

// const createUser = {
//   body: Joi.object().keys({
//     email: Joi.string().required().email(),
//     password: Joi.string().required().custom(password),
//     name: Joi.string().required(),
//     role: Joi.string().required().valid('user', 'admin'), 
//   }),
// };

const getUsers = {
  query: Joi.object().keys({
    userType: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const getWallet = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }),
};

const getAdmin = {
  params: Joi.object().keys({
    adminId: Joi.string().required(),
  }),
};

const deleteAdmin = {
  params: Joi.object().keys({
    adminId: Joi.string().required(),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      firstName: Joi.string().allow(null, ''),
      lastName: Joi.string().allow(null, ''),
      status: Joi.string().allow(null, '').valid('approved', 'blocked', 'deleted','active'),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updatePassword = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    oldPassword: Joi.string().required().custom(password),
    newPassword: Joi.string().required().custom(password),
  }),
};

const logOut = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const togglePaymentStatus = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    type: Joi.string().required().valid('cash','wallet'),
    status: Joi.boolean().required().valid(true,false),
  }), 
};

const toggleUserStatus = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
    status: Joi.string().required().valid('active','suspended','approved'),
  }), 
};

const sendEmail = {
  body: Joi.object().keys({
    to: Joi.string().required(),
    subject: Joi.string().required(),
    message: Joi.string().required(),
  }), 
};

const isEmailExist = {
  params: Joi.object().keys({
    email: Joi.string().required().email(),
  }), 
};

const isPhoneExist = {
  params: Joi.object().keys({
    phone: Joi.string().required(),
  }), 
};


const getPricePerKm = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }), 
};

const updatePricePerKm = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }),

  body: Joi.object().keys({
    pricePerKm: Joi.number().required(),
    packageType: Joi.string().required().valid('haulage','sendAPackage','bookARide','buyForMe','deduction'),
  }), 
};

const getPromoCodes = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }), 
};

const addPromoCode = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    discountPercentage: Joi.number().required(),
    promoCode: Joi.string().required(),
    duration: Joi.number().required(),
  }), 
};

const deletePromoCode = {
  params: Joi.object().keys({
    promoCode: Joi.string().required(),
  }), 
};

const subscribe = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
  }), 
};

const sendFeedback = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    subject: Joi.string().required(),
    message: Joi.string().required(),
  }),
};

const analytics = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }),
};

module.exports = {
  subscribe,
  analytics,
  sendFeedback,
  getPromoCodes,
  addPromoCode,
  deletePromoCode,
  getPricePerKm,
  updatePricePerKm,
  getAdmin,
  deleteAdmin,
  getUsers,
  getWallet,
  getUser,
  sendEmail,
  updateUser,
  isPhoneExist,
  deleteUser,
  logOut,
  updatePassword,
  isEmailExist,
  toggleUserStatus,
  togglePaymentStatus,
};
