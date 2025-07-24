/* eslint-disable no-plusplus */
/* eslint-disable eqeqeq */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
// const httpStatus = require('http-status');
// const ApiError = require('../utils/ApiError');
// const { paginate, sortItems } = require('../utils/extras');
const { Order } = require('../models')

/**
 * Get Orders
 * @param {object} body
 * @returns {String}
 */
const getOrders = async (filter) => {
    let result = {};
    if(!filter.orderType){
        const status = filter.status === 'processing'
        ? {status: {$nin: ['completed','canceled']}}
        : {...filter}
        const totalOrders = filter.status 
        ? await Order.countDocuments(status)
        : await Order.countDocuments()
        result = {
            total: totalOrders
        }
    }

    if(filter.timeFrame && filter.orderType){
        if(filter.timeFrame.toLowerCase() === 'monthly'){
            const lastMonthOrder = await getOrderBy('lastMonth', filter.orderType, filter.status);
            const thisMonthOrder = await getOrderBy('thisMonth', filter.orderType, filter.status);
            const stats = ((lastMonthOrder.length - thisMonthOrder.length) / lastMonthOrder.length) * 100;
    
            // console.log('lastMonthOrder',lastMonthOrder);
            // console.log('thisMonthOrder',thisMonthOrder);
            console.log('stats monthly',stats);
    
            result = {
                total: thisMonthOrder.length,
                stats: stats == 'Infinity' || stats == '-Infinity' || !stats ? 0 : stats
            }
        }else{
            const lastWeekOrder = await getOrderBy('lastWeek', filter.orderType, filter.status);
            const thisWeekOrder = await getOrderBy('thisWeek', filter.orderType, filter.status);
            const stats = ((lastWeekOrder.length - thisWeekOrder.length) / lastWeekOrder.length) * 100
    
            // console.log('lastWeekOrder',lastWeekOrder);
            // console.log('thisWeekOrder',thisWeekOrder);
            console.log('stats 00',stats);
    
            result = {
                total: thisWeekOrder.length,
                stats: stats == 'Infinity' || stats == '-Infinity' || !stats ? 0 : stats
            }
        }
    }
   return result;    
};

const getOrderBy = async (timeFrame,orderType,status) => {
    let startDate = new Date();
    let stopDate = new Date();

    if(timeFrame === 'lastMonth'){
        startDate.setDate(1);
        startDate.setMonth(startDate.getMonth() - 1); // first day of previous month
        stopDate.setDate(0); // last day of previous month
    }
    else if(timeFrame === 'thisMonth'){
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1) // first day of this month
    }
    else if(timeFrame === 'lastWeek'){
        // Sunday - Sunday
        // let startDate = new Date();
        // let stopDate = new Date();
        // startDate = new Date(new Date().getTime() - 60 * 60 * 24 * 3 * 1000)
        // stopDate = new Date(startDate);
        // const day = startDate.getDay()
        // const diffToMonday = startDate.getDate() - day + (day === 0 ? -7 : 1)
        // startDate.setDate(diffToMonday)
        // stopDate.setDate(diffToMonday + 7);

        startDate = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000)
        stopDate = new Date(startDate);
        const day = startDate.getDay()
        const diffToMonday = startDate.getDate() - day + (day === 0 ? -6 : 1)
        startDate.setDate(diffToMonday); // Mon of a week ago
        stopDate.setDate(diffToMonday + 6); // Sun of a week ago
    } 
    else if(timeFrame === 'thisWeek'){
        const date = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000)
        startDate = new Date(date);
        const day = date.getDay()
        const diffToMonday = date.getDate() - day + (day === 0 ? - 6 : 1)
        startDate.setDate(diffToMonday + 6); // Sun of a week ago
    }

    const orders = status 
    ? await Order.find({orderType, status, created_at:{$gte: startDate, $lte: stopDate}})
    : await Order.find({orderType, created_at:{$gte: startDate, $lte: stopDate}});

    console.log('omo status===',timeFrame,startDate,stopDate);
    if(!orders) return [];
    return orders;
}

const totalIncome = async() =>{
    const totalCost = sum(await Order.find({status:'completed'}),'orderCost')
    const sendAPackageTotalCost = sum(await Order.find({status:'completed', orderType: 'package'}),'orderCost')
    const buyForMeTotalCost = sum(await Order.find({status:'completed', orderType: 'buyForMe'}),'orderCost')
    const haulageTotalCost = sum(await Order.find({status:'completed', orderType: 'haulage'}),'orderCost')
    const bookARideTotalCost = sum(await Order.find({status:'completed', orderType: 'bookARide'}),'orderCost')
    // const overAll = sendAPackageTotalCost + buyForMeTotalCost + haulageTotalCost + bookARideTotalCost
    // return{
    //     totalCost,
    //     sendAPackageTotalCost: (sendAPackageTotalCost/overAll) * 360,
    //     buyForMeTotalCost: (buyForMeTotalCost/overAll) * 360,
    //     haulageTotalCost: (haulageTotalCost/overAll) * 360,
    //     bookARideTotalCost: (bookARideTotalCost/overAll) * 360,
    // }
    return{
        totalCost,
        sendAPackageTotalCost,
        buyForMeTotalCost,
        haulageTotalCost,
        bookARideTotalCost,
    }
}

const getCharts = async(filter) =>{
    const { timeFrame } = filter;
    const startDate = new Date(new Date().getFullYear(), 0, 1);
    let pipeline = [];
    if(timeFrame.toLowerCase() === "weekly"){
        pipeline = [
            {
                $match: {
                    created_at: {$gt: startDate},
                }
            },
            {
                $group: {
                    _id: {$week: '$created_at'},
                    totalOrders: {$sum: 1}
                }
            },
            {$sort: {_id: 1}}
        ];
    }else{
        pipeline = [
            {
                $match: {
                    created_at: {$gt: startDate},
                }
            },
            {
                $group: {
                    _id: {$month: '$created_at'},
                    totalOrders: {$sum: 1}
                }
            },
            {$sort: {_id: 1}}
        ];
    }
    const chartData = await Order.aggregate(pipeline)
    const months = [1,2,3,4,5,6,7,8,9,10,11,12]
    const weeks = populateWeeks();

    const allChartData = timeFrame.toLowerCase() === "monthly"
    ? months.map((month) =>{
        if(!(chartData.find(chart=> chart._id === month))){
            return {
                _id: month,
                totalOrders: 0
            }
        }
        return chartData.find(chart=> chart._id === month);
    })
    : weeks.map((week) =>{
        if(!(chartData.find(chart=> chart._id === week))){
            return {
                _id: week,
                totalOrders: 0
            }
        }
        return chartData.find(chart=> chart._id === week);
    })
    return Promise.all(allChartData).then(docs => docs);
}

const populateWeeks = () =>{
    const weeks = [];
    for (let i = 1; i <= 56; i++) {
        weeks.push(i)
    }
    return weeks;
}

const sum = function(items, prop){
    return items.reduce( function(a, b){
        return Number(a) + Number(b[prop]);
    }, 0);
};

module.exports = {
    getOrders,
    getCharts,
    totalIncome,
};
