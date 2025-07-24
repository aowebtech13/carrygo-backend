const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getOrders = {
    query: Joi.object().keys({
        orderType: Joi.string().allow(null, '').valid('haulage','package','buyForMe','bookARide'),
        timeFrame: Joi.string().allow(null, '').valid('monthly','weekly'),
        status: Joi.string().allow(null,'').valid('processing','accepted','picked','completed','canceled'),
    })
    .min(1),
};

const getCharts = {
    params: Joi.object().keys({
        adminId: Joi.string().custom(objectId),
    }),
    query: Joi.object().keys({
        timeFrame: Joi.string().required().valid('monthly','weekly'),
    })
};

module.exports = {
    getOrders,
    getCharts
};
