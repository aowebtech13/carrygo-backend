const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getRequests = {
  params: Joi.object().keys({
    adminId: Joi.string().custom(objectId),
  }),
};

const getRequest = {
    params: Joi.object().keys({
        orderId: Joi.string().custom(objectId),
    }),
};

const updateRequestStatus = {
    params: Joi.object().keys({
        orderId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
    .keys({
        status: Joi.string().valid('accepted','declined'),
    })
    .min(1),
};

const sendQuotation = {
    body: Joi.object()
    .keys({
        orderId: Joi.required().custom(objectId),
        quotation: Joi.number().required(),
    })
};

module.exports = {
    getRequest,
    getRequests,
    sendQuotation,
    updateRequestStatus,
};
