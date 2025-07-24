const Joi = require('joi');

const resolveAccountNumber = {
  body: Joi.object().keys({
    accountNumber: Joi.string().required(),
    bankCode: Joi.string().required(),
  }), 
};

const createTransaction = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    transfer: Joi.string().required().valid('bank','wallet'),
    recipient: Joi.string().allow(null,''),
    accountNumber: Joi.string().allow(null,''),
    bankCode: Joi.string().allow(null,''),
    bankName: Joi.string().allow(null,''),
    recieverName: Joi.string().allow(null,''),
    amount: Joi.number().required(),
    description: Joi.string().required(),
    password: Joi.string().required(),
  }), 
};

const getTransactions = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }), 
  query: Joi.object().keys({
    timeFrame: Joi.string(),
    page: Joi.string(),
    limit: Joi.string(),
    startDate: Joi.string(),
    endDate: Joi.string(),
  }), 
};

const getTransaction = {
  params: Joi.object().keys({
    reference: Joi.string().required(),
  }), 
};

const generateNubanAccount = {
  params: Joi.object().keys({
    email: Joi.string().required(),
  }), 
};

const getNubanAccount = {
  params: Joi.object().keys({
    email: Joi.string().required(),
  }), 
};

module.exports = {
  getNubanAccount,
  generateNubanAccount,
  resolveAccountNumber,
  createTransaction,
  getTransactions,
  getTransaction,
};
