/* eslint-disable no-console */
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { paginate, sortItems } = require('../utils/extras');
const { Order, Haulage, Quotation } = require('../models')

/**
 * Get Requests
 * @param {object} body
 * @returns {String}
 */
const getRequests = async (filter,options) => {
    const orders = await Order.find(filter);
    if(!orders) return {};

    const haulageRequests = await orders.map(async order =>{
        const haulage = await Haulage.findOne({orderId: order.orderId}, '-__v -_id -createdAt -updatedAt');
        console.log('haulage',haulage)
        return {
            orderId: order._id,
            userId: order.userId,
            orderType: order.orderType,
            pickupAddress: order.pickupAddress,
            deliveryAddress: order.deliveryAddress,
            pickupLat: order.pickupLat,
            deliveryLat: order.deliveryLat,
            receiverName: order.receiverName,
            receiverNumber: order.receiverNumber,
            modeOfPayment: order.modeOfPayment,
            status: order.status,
            // ...haulage._doc
        }

    });
    const requests = await Promise.all(haulageRequests).then(docs => {return docs;})

    if(options.sortBy){
        const sortedRequests = sortItems(requests,options.sortBy, options.order || '');
        return paginate(sortedRequests,options);;
    }
    return paginate(requests,options);    
};

 /**
* Get Request
* @param {string} reviewId
* @returns {Promise<User>}
*/
const getRequest = async (orderId) => {
    const order = await Order.findById(orderId);
    if(!order){
        throw new ApiError(httpStatus.NOT_FOUND, 'Request Not found');
    }
    const haulage = await Haulage.findOne({orderId: order.orderId});
    console.log('haulage',haulage)

    return {
        orderId: order._id,
        userId: order.userId,
        orderType: order.orderType,
        pickupAddress: order.pickupAddress,
        deliveryAddress: order.deliveryAddress,
        pickupLat: order.pickupLat,
        deliveryLat: order.deliveryLat,
        receiverName: order.receiverName,
        receiverNumber: order.receiverNumber,
        modeOfPayment: order.modeOfPayment,
        status: order.status,
        // ...haulage._doc
    }
 };

 /**
 * Update request status
 * @param {ObjectId} reviewId
 * @param {Object} requestBody
 * @returns {Promise<User>}
 */
const updateRequestStatus = async (orderId, requestBody) => {
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(httpStatus.NOT_FOUND, 'Reqeust not found');
    Object.assign(orderId, requestBody);
    await orderId.save();
    return orderId;
};

/**
 * Send Quotation
 * @param {Object} requestBody
 * @returns {Promise<User>}
 */
 const sendQuotation = async (requestBody) => {
    return Quotation.create(requestBody);
};

module.exports = {
    getRequest,
    getRequests,
    sendQuotation,
    updateRequestStatus,
};
