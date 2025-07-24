const Joi = require('joi');
const { password } = require('./custom.validation');

const createHpRider = {
  body: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().required(),
    dob: Joi.string().required(),
    phone: Joi.string().required(),
    password: Joi.string().required().custom(password),
    country: Joi.string().required(),
    state: Joi.string().allow(null, ''),
    gender: Joi.string().required().valid('male', 'female'),
  }),
};

const createDsoRider = {
  body: Joi.object().keys({
    dsoId: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().required(),
    dob: Joi.string().required(),
    phone: Joi.string().required(),
    password: Joi.string().required().custom(password),
    country: Joi.string().required(),
    state: Joi.string().allow(null, ''),
    gender: Joi.string().required().valid('male', 'female'),
  }),
};

const updateRider = {
    body: Joi.object().keys({
      email: Joi.string().required(),
      riderCard: Joi.string().allow(null, ''),
      healthCertificate: Joi.string().allow(null, ''),
      selectedIdCard: Joi.string().allow(null, ''),
      idCard: Joi.string().allow(null, ''),
      passport: Joi.string().allow(null, ''),
      originCertificate: Joi.string().allow(null, ''),
      lasra: Joi.string().allow(null, ''),
      guarantorForm: Joi.string().allow(null, ''),
      vehicleType: Joi.string().allow(null, ''),
      vehicleYear: Joi.string().allow(null, ''),
      vehicleModel: Joi.string().allow(null, ''),
      licenseNumber: Joi.string().allow(null, ''),
      academicCredentials: Joi.string().allow(null, ''),
    }),
};

const updateRiderStatus = {
    body: Joi.object().keys({
      status: Joi.string().required().valid('approved', 'blocked', 'deleted'),
    }),
    params: Joi.object().keys({
        riderId: Joi.string().required(),
      }),
};

const getRider = {
  params: Joi.object().keys({
      riderId: Joi.string().required(),
  }),
};

const getRiderByEmail = {
    params: Joi.object().keys({
        email: Joi.string().required(),
    }),
};

const availableRiders = {
  params: Joi.object().keys({
      lat: Joi.number().required(),
      long: Joi.number().required(),
  }),
};

module.exports = {
    createHpRider,
    createDsoRider,
    updateRider,
    availableRiders,
    getRider,
    getRiderByEmail,
    updateRiderStatus
};