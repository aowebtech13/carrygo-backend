const Joi = require('joi');
const { password } = require('./custom.validation');

const createDSO = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    dob: Joi.string().required(),
    // carrierMode: Joi.string().required(),
    phone: Joi.string().required(),
    password: Joi.string().required().custom(password),
    country: Joi.string().required(),
    state: Joi.string().required().allow(null, ''),
    gender: Joi.string().required().valid('male', 'female'),
  }),
};

const updateDSO = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        companyName: Joi.string().required(),
        companyDescription: Joi.string().required(),
        // cac: Joi.string().allow(null, ''),
        hackneyPermit: Joi.string().allow(null, ''),
        roadWorthiness: Joi.string().allow(null, ''),
        license: Joi.string().allow(null, ''),
        vehicleModel: Joi.string().allow(null, ''),
        // vehicleType: Joi.string().allow(null, ''),
        licensePlateNumber: Joi.string().allow(null, ''),
        engineNumber: Joi.string().allow(null, ''),
        chasisNumber: Joi.string().allow(null, ''),
        autoVin: Joi.string().allow(null, ''),
        officeLocation: Joi.string().allow(null, ''),
    }),
};

const updateDSOStatus = {
    body: Joi.object().keys({
      status: Joi.string().required().valid('approved', 'blocked','deleted'),
    }),
    params: Joi.object().keys({
        dsoId: Joi.string().required(),
    }),
};

const getDSO = {
    params: Joi.object().keys({
        dsoId: Joi.string().required(),
    }),
};

const getDSOByEmail = {
    params: Joi.object().keys({
        email: Joi.string().required(),
    }),
};

module.exports = {
    createDSO,
    updateDSO,
    updateDSOStatus,
    getDSO,
    getDSOByEmail,
};
