/* eslint-disable no-lonely-if */
/* eslint-disable no-use-before-define */
/* eslint-disable object-shorthand */
/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
const axios = require('axios');
const moment = require('moment');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Transaction, NextPayout, Bank, Wallet, NubanAccount, User, Order}  = require('../models');
const { getRndInteger, isExpired, paginate, sort, sortItems} = require('../utils/extras');
const { addCustomer } = require('./user.service');

/**
 * Create Transaction
 * @param {object} requestBody
 * @returns {string}
 */

const createTransaction = async (requestBody) => {
    return Transaction.create(requestBody);
};

const updateUserBalance = async (userId, amount, type) => {
    return type === 'inc' 
    ? Wallet.updateOne({userId},{$inc:{balance: amount}})
    : Wallet.updateOne({userId},{$inc:{balance: -amount}})
}

const createCustomer = async (payload) => {
    console.log(payload)
    const {email, firstname, lastname, phone} = payload;
    const config = {
        method: 'POST',
        url: 'https://api.paystack.co/customer',
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
            'Content-Type': 'application/json',
        },
        data: {
            email,
            first_name: firstname,
            last_name: lastname,
            phone
        }
    };

    const customer = await axios(config).then(async function (response) {
        const {customer_code,id} = response.data.data;
        await addCustomer({email,customerId:id,customerCode:customer_code})
        return response.data.data
    })
    .catch(error => {console.log(error.response.data);throw new ApiError(httpStatus.NOT_FOUND, `Error creating customer ${error}`)})
    return customer;
}

const generateNubanAccount = async (customer) => {
    const config = {
        method: 'POST',
        url: 'https://api.paystack.co/dedicated_account',
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
            'Content-Type': 'application/json',
        },
        data: {
            customer,
            preferred_bank: 'access-bank'
        }
    };

    const account = await axios(config).then(function (response) {return response.data.data})
    .catch(error => {console.log(error.response.data);throw new ApiError(httpStatus.NOT_FOUND, error.response.data.message)})
    return account;
}

const saveNubanAccount = async (requestBody) => {
    return NubanAccount.create(requestBody);
};

const getNubanAccount = async (email) => {
    return NubanAccount.findOne({email});
};

/**
 * Get Transactions
 * @param {object} filter
 * @param {object} options
 * @returns {string}
 */
const getTransactions = async (filter, options) => {
    if(!options.timeFrame && !options.startDate) return Transaction.paginate(filter, options);
    const transactions = await getTransactionBy(options, filter.status)

    const txns = await Promise.all(transactions).then(docs => {return docs;})

    if(options.sortBy){
      const sortedTransactions = sortItems(txns,options.sortBy, options.order || '');
      return paginate(sortedTransactions,options);;
    }
    return paginate(txns,options);   
}


const getTransactionBy = async (options,status) => {
    let startDate = new Date();
    let endDate = new Date();
    
    if(options.startDate){
        startDate = options.startDate
        endDate = options.endDate || new Date();
        console.log("omo")
    }else{
        console.log("wasere")
        const timeFrame = options.timeFrame.toLowerCase()
        if(timeFrame === 'lastmonth'){
            startDate.setDate(1);
            startDate.setMonth(startDate.getMonth() - 1); // first day of previous month
            endDate.setDate(0); // last day of previous month
        }
        else if(timeFrame === 'thismonth'){
            startDate.setDate(1); // first day of this month
        }
        else if(timeFrame === 'lastweek'){
            startDate = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000)
            endDate = new Date(startDate);
            const day = startDate.getDay()
            const diffToMonday = startDate.getDate() - day + (day === 0 ? -6 : 1)
            startDate.setDate(diffToMonday); // Mon of a week ago
            endDate.setDate(diffToMonday + 6); // Sun of a week ago
        } 
        else if(timeFrame === 'thisweek'){
            const date = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000)
            startDate = new Date(date);
            const day = date.getDay()
            const diffToMonday = date.getDate() - day + (day === 0 ? -6 : 1)
            startDate.setDate(diffToMonday + 6); // Sun of a week ago
        }else if(timeFrame === 'today'){
            startDate = new Date();
            endDate.setDate(startDate.getDate() + 1)
        }
    }

    console.log('startDate',new Date(startDate))
    console.log('endDate',new Date(endDate))
    const transactions = status 
    ? await Transaction.find({status, created_at:{$gte: new Date(startDate), $lte: new Date(endDate)}})
    : await Transaction.find({created_at:{$gte: new Date(startDate), $lte: new Date(endDate)}});
    
    return transactions;
}
// 61fe2585cfdc2f0021e3d58b

/**
 * Get Customers Transactions
 * @param {object} filter
 * @param {object} options
 * @returns {string}
 */
 const getCustomersTransactions = async (filter, options) => {
    const transactions = options.startDate && options.endDate
    ? await Transaction.find({...filter, dateCreated: {$gte: options.startDate, $lt: options.endDate}})
    : await Transaction.find(filter);

    if(options.sortBy){
        const sorted = sort(transactions,options.sortBy, options.order || '');
        return paginate(sorted,options);;
    }
    return paginate(transactions,options);
}

/**
 * Get Transaction
 * @param {string} transaction_id
 * @returns {string}
 */
const getTransaction = async (reference) => {
    const transaction = await Transaction.findOne({$or:[{reference},{txRef:reference}]});
    if(!transaction) return null;
    console.log("--", transaction.userId)
    const user = await User.findOne({_id: transaction.userId});
    const wallet = await Wallet.findOne({userId: transaction.userId});
    return {
        ...transaction._doc,
        recieverName: user ? `${user.firstName } ${user.lastName}` : '',
        reference: transaction.txRef,
        bankName: wallet ? wallet.bankName : '',
        accountNumber: wallet ? wallet.accountNumber: '',
    }
}

const createNextPayout = async(carer_id) => {
    return NextPayout.create({carer_id, next_payout: moment(Date.now()).add(1, 'M')});
};

const updateNextPayout = async(carer_id) => {
    return NextPayout.findOneAndUpdate({carer_id},{"$set": {next_payout:moment().add(1, 'months').calendar()}});
};

const getNextPayOut = async(carer_id) => {
    return NextPayout.findOne({carer_id});
};

/**
 * Update Requests
 * @param {string} requestId
 * @param {Object} payload
 * @param {string} whatToUpdate
 * @returns {string}
 */
 const updateTransactionStatus = async(reference, payload)=>{
    const updated = await Transaction.findOneAndUpdate({reference},{"$set":payload},{new: true})
    if (!updated) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Error updating transaction status');
    }
    await Bank.findOneAndUpdate({reference},{"$set":{ last_payout: Date.now(), next_payout: moment().add(1, 'months').calendar()}})
    return updated;
}

const createTransactionReciept = async(name,account_number,bank_code) =>{
    const config = {
        method: 'POST',
        url: 'https://api.paystack.co/transferrecipient',
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
            'Content-Type': 'application/json',
        },
        data: {
            type: "nuban", 
            name,
            account_number,
            bank_code,
            currency: "NGN"
        }
    };

    const receipt = await axios(config).then(function (response) {return response.data.data})
    .catch(error => {throw new ApiError(httpStatus.NOT_FOUND, error.response.data.message)});
    return receipt;
}

const initiatePayment = async(amount,recipient) =>{
    const config = {
        method: 'POST',
        url: 'https://api.paystack.co/transfer',
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
            'Content-Type': 'application/json',
        },
        data: {
            source: "balance", 
            amount,
            recipient,
            reason: 'Transfer testing',
        }
    };

    const initialize = await axios(config).then(function (response) {return response.data.data})
    .catch(error => {throw new ApiError(httpStatus.NOT_FOUND, error.response.data.message)});
    return initialize;
}

const finalizePayment = async(requestBody) =>{
    const {transfer_code,otp} = requestBody;
    const config = {
        method: 'POST',
        url: 'https://api.paystack.co/transfer/finalize_transfer',
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
            'Content-Type': 'application/json',
        },
        data: {
            transfer_code,
            otp,
        }
    };

    const receipt = await axios(config).then(function (response) {return response.data.data})
    .catch(error => {throw new ApiError(httpStatus.NOT_FOUND, error.response.data.message)});
    return receipt;
}

const paySalary = async(email,amount,card,bank,authorization_code ) =>{
    const config = {
        method: 'POST',
        url: 'https://api.paystack.co/charge',
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
            'Content-Type': 'application/json',
        },
        data: {
            email, 
            amount: amount * 100,
            card,
            bank,
            authorization_code 
        }
    };

    const chargeCard = await axios(config).then(function (response) {return response.data.data})
    .catch(error => {throw new ApiError(httpStatus.NOT_FOUND, error.response.data.message)});
    console.log('chargeCard',chargeCard);
    return chargeCard;
}

const submitPin = async(pin, reference) =>{
    const config = {
        method: 'POST',
        url: 'https://api.paystack.co/charge/submit_pin',
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
            'Content-Type': 'application/json',
        },
        data: {
            pin, 
            reference,
        }
    };

    const pinSubmitted = await axios(config).then(function (response) {return response.data.data})
    .catch(error => {throw new ApiError(httpStatus.NOT_FOUND, error.response.data.message)});
    console.log('pinSubmitted',pinSubmitted);
    return pinSubmitted;
}

const submitOTP = async(otp, reference) =>{
    const config = {
        method: 'POST',
        url: 'https://api.paystack.co/charge/submit_otp',
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
            'Content-Type': 'application/json',
        },
        data: {
            otp, 
            reference,
        }
    };

    const otpSubmitted = await axios(config).then(function (response) {return response.data.data})
    .catch(error => {throw new ApiError(httpStatus.NOT_FOUND, error.response.data.message)});
    console.log('otpSubmitted',otpSubmitted);
    return otpSubmitted;
}

const updateWallet = async(user_id, amount, option)=>{
    amount = option === 'inc' ? amount : -amount;
    return Wallet.findOneAndUpdate({user_id},{$inc: {amount}});
}

module.exports = {
    getNubanAccount,
    generateNubanAccount,
    createTransaction,
    getTransactions,
    updateUserBalance,
    getTransaction,
    updateTransactionStatus,
    initiatePayment,
    finalizePayment,
    getCustomersTransactions,
    createTransactionReciept,
    createNextPayout,
    updateNextPayout,
    getNextPayOut,
    paySalary,
    createCustomer,
    saveNubanAccount,
    submitPin,
    updateWallet,
    submitOTP
};
