const Joi = require('joi');

const sendMessage = {
    body: Joi.object().keys({
        adminId: Joi.string().required(),
        customerId: Joi.string().required(),
        senderId: Joi.string().required(),
        message: Joi.string().required(),
      }),
};

const getMessages = {
    params: Joi.object().keys({
        chatId: Joi.string().required(),
    }),
};

const getMessagesByUser = {
    params: Joi.object().keys({
        adminId: Joi.string().required(),
        customerId: Joi.string().required(),
    }),
};

const readMessage = {
    params: Joi.object().keys({
        adminId: Joi.string().required(),
        customerId: Joi.string().required(),
        readerId: Joi.string().required(),
    }),
};

const getChats = {
    params: Joi.object().keys({
        userId: Joi.string().required(),
    }),
    query: Joi.object().keys({
        sortBy: Joi.string().allow(null, ''),
        order: Joi.string().allow(null, ''),
        limit: Joi.number().integer().min(1).allow(null, 0),
        page: Joi.number().integer().min(1).allow(null, 0),
    }), 
};


module.exports = {
    sendMessage,
    getMessages,
    getChats,
    getMessagesByUser,
    readMessage,
};