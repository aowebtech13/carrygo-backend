/* eslint-disable no-use-before-define */
/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
// const httpStatus = require('http-status');
// const ApiError = require('../utils/ApiError');
// const mongoose = require('mongoose');
const {ObjectId} = require('mongoose').Types;
const Pusher = require("pusher");

const {PUSHER_APP_ID,PUSHER_KEY,PUSHER_SECRET,PUSHER_CLUSTER} = process.env;
const Geo = require('geo-nearby');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { paginate, sortItems} = require('../utils/extras');

const { Order, Haulage, BuyForMe, User, Rider, PackageOrder } = require('../models');
const { formatData } = require('../utils/extras');

const pusher = new Pusher({
    appId: PUSHER_APP_ID,
    key: PUSHER_KEY,
    secret: PUSHER_SECRET,
    cluster: PUSHER_CLUSTER,
});

/**
 * Get Orders
 * @param {object} body
 * @returns {String}
 */
const getOrders = async (fitler,options) => {
    const orders = options.startDate 
    ? await Order.find({created_at:{$gte: new Date(options.startDate), $lte: options.endDate ? new Date(options.endDate) : new Date()}}).sort({$natural: -1})
    : await Order.find(fitler);

    // console.log('ord',orders)
    console.log('options',options)
    const ord = orders.map(async order=>{
        const customer = await User.findById(order.userId)
        return {
            ...order._doc,
            customerName: customer ? `${customer.firstName || ''} ${customer.lastName || ''}` : '',
            customerPhoneNumber: customer ? customer.phone : '',
            customerImage: customer ? customer.avatar : '',
        }
    })
    const orderPromise = await Promise.all(ord).then(docs => {return docs;})
    if(options.sortBy){
        const sortedRiders = sortItems(orderPromise,options.sortBy, options.order || '');
        return paginate(sortedRiders,options);;
      }
      return paginate(orderPromise,options); 
};

const getOrderActivities = async (fitler,options) => {
    const orders = await Order.find(fitler);

    // haulage, package, buyForMe, bookARide
    const activities = await orders.map(async order=>{
        let message = "";
        if(order.orderType === 'haulage'){
            message = "";
        }else if(order.orderType === 'buyForMe'){
            message = "";
        }else if(order.orderType === 'package'){
            message = "";
        }else{
            // bookARide
            message = "";
        }
        return {
            message
        };
    })

    const riderActivities = await Promise.all(activities).then(docs => {return docs;})
    if(options.sortBy){
        const sortedRiders = sortItems(riderActivities,options.sortBy, options.order || '');
        return paginate(sortedRiders,options);;
      }
      return paginate(riderActivities,options); 
};

 /**
* Get order
* @param {string} trackingId
* @returns {Promise<User>}
*/
const getOrderByTrackingId = async (trackingNumber) => {
    console.log('trackingNumber',trackingNumber)
    let order = ObjectId.isValid(trackingNumber) 
    ? await Order.findOne({$or:[{trackingNumber},{_id:trackingNumber}]})
    : await Order.findOne({trackingNumber});
    if(!order) throw new ApiError(httpStatus.NOT_FOUND, 'Order Not found');

    console.log('na the order be this oooo',order);

    // let extras;
    // if(order.orderType === 'haulage'){
    //     extras = await Haulage.findOne({orderId: order._id}, '-_id -created_at -updated_at');
    //     console.log(extras)
    //     // delete extras._doc._id
    // }else if(order.orderType === 'buyForMe'){
    //     extras = await BuyForMe.findOne({orderId: order._id}, '-_id -created_at -updated_at');
    //     // delete extras._doc._id
    // }else if(order.orderType === 'package'){
    //     extras = await PackageOrder.findOne({orderId: order._id});
    // }
    // const additional_data = extras ? { ...extras._doc} : {}

    const user = await User.findById(order.userId);
    const rider = order.riderId ? await User.findById(order.riderId) : {};
    const otherRiderInfo = order.riderId ? await Rider.findOne({userId: order.riderId}) : {};
    
    const additional_data = rider ? { 
        customerName: user ? `${user.firstName} ${user.lastName}` : '', 
        customerPhoneNumber: user ? user.phone : '',
        riderName: rider ? `${rider.firstName} ${rider.lastName}` : '', 
        riderPhoneNumber: rider ? rider.phone : '',
        riderLicenseNumber: otherRiderInfo ? otherRiderInfo.licenseNumber : ''
    } : {}
    order = { ...order._doc, 
        ...additional_data, 
    }
    formatData(order)
    return order;
 };


/**
 * Create Order
 * @param {object} body
 * @returns {object}
 */
const createOrder = async (body) => {
    // buyForMe haulage package bookARide
    body.trackingNumber = `CG${new Date().getTime()}`;
    const create_order = await Order.create(body)
    body.orderId = create_order._id;
    const {orderType} = body;
    let order = {};
    if(orderType.toLowerCase() === 'buyForMe') order = await BuyForMe.create(body);
    if(orderType.toLowerCase() === 'haulage') order = await Haulage.create(body);
    if(orderType.toLowerCase() === 'package') order = await PackageOrder.create(body);
    // if(orderType.toLowerCase() === 'bookARide') order = await BuyForMe.create(body);
    formatData(order)
    return {
        ...order._doc,
        trackingNumber: body.trackingNumber
    };
};

const reassignRider = async (updateBody) => {
    const {orderId, id} = updateBody;
    const rider = await User.findOne({$or:[{email: id},{uniqueId: id}]})
    const riderInfo = await Rider.findOne({userId: rider._id})
    const {lastLat,lastLng} = riderInfo
    console.log('rider',rider);
    if (!rider) throw new ApiError(httpStatus.NOT_FOUND, 'Rider not found');
    const order = await Order.findOne({_id:orderId});
    console.log('order',order);
    if (!order) throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');

    const user = order.riderId ? await User.findById(order.riderId) : {};
    const data = {order: {...order,rider},user};
    pusher.trigger(`riderchannel_${rider.email}`, "Order Re-assigned", {data});
    
    Object.assign(order, {riderId: rider._id, currentPackageLng:lastLng, currentPackageLat:lastLat});
    await order.save();
    return order; 
};

const availableRiders = async (payload) => {
    const {lat,long} = payload
    const riderLocations = await Rider.find();
    // console.log('riderLocations',riderLocations)
    if(riderLocations.length <= 0) return []
    const locations =  riderLocations.map(rider =>{
        return {
            lat: rider.lastLat,
            lon: rider.lastLng,
            name: rider.userId
        }
    })
    const data = await Promise.all(locations).then(docs => {return docs;})
    const geo = new Geo(data, {setOptions: { id: 'name', lat: 'lat', lon: 'lon' } });

    const available_riders = geo.nearBy(lat, long, 5000); // 5km radius
    console.log('geo',geo)
    console.log('available_riders',available_riders)
    const riderInfo = available_riders.map(async available_rider => {
      const {i} = available_rider  
      const rider = await Rider.findOne({userId: i}, '-__v -createdAt -updatedAt -_id');
      const user = await User.findOne({_id: i}, '-__v -createdAt -updatedAt -_id');
      const filesCount = rider ? attachmentCount(rider) : 0;

      return {
        riderId: i,
        filesCount,
        ...user._doc,
        ...rider._doc,
      }
    })

    const riders = await Promise.all(riderInfo).then(docs => {return docs;})
    return riders;  
}

const attachmentCount = (rider) =>{
    let count = 0;
    if(rider.roadWorthiness){
       count++;
    } 
    if(rider.vehicleReceipt){
      count++;
    } 
    if(rider.healthCertificate){
       count++;
    } 
    if(rider.idCard){
       count++;
    } 
    if(rider.passport){
       count++;
    }
    if(rider.originCertificate){
       count++;
    }
    if(rider.lasra){
       count++;
    }
    if(rider.guarantorForm){
       count++;
    }
    if(rider.academicCredentials){
       count++;
    } 
    return count;
  } 
  

module.exports = {
    createOrder,
    availableRiders,
    reassignRider,
    getOrders,
    getOrderActivities,
    getOrderByTrackingId
};
