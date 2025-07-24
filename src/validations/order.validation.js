const Joi = require('joi').extend(require('@joi/date'));

const getOrderByTrackingId = {
  params: Joi.object().keys({
      trackingId: Joi.string().required(),
    }),
};

const getOrders = {
  query: Joi.object().keys({
    sortBy: Joi.string().allow(null, ''),
    order: Joi.string().allow(null, ''),
    limit: Joi.number().integer().min(1).allow(null, 0),
    page: Joi.number().integer().min(1).allow(null, 0),
    startDate: Joi.date().format('DD-MM-YYYY').utc().allow(null, ''),
    endDate: Joi.date().format('DD-MM-YYYY').utc().allow(null, ''),
  }), 
};

const reassignRider = {
  body: Joi.object().keys({
      orderId: Joi.string().required(),
      id: Joi.string().required(),
    }),
};

module.exports = {
    getOrderByTrackingId,
    reassignRider,
    getOrders
};
// role: Joi.string().required().valid('user', 'admin'),
