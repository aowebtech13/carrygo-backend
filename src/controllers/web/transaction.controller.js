/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable prettier/prettier */

const Flutterwave = require('flutterwave-node-v3');

const flutter = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY);
const axios = require('axios');
const httpStatus = require('http-status');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const {  transactionService, userService } = require('../../services');
const { getWallet, getUserById, getCustomer, getUserByEmail, getWalletByAccountNumber } = require('../../services/user.service');


const listBanks = catchAsync(async (req, res) => {
    // const config = {
    //     method: 'GET',
    //     url: 'https://api.paystack.co/bank'
    // };

    // const banks = await axios(config).then(function (response) {return response.data.data})
    // .catch(error => {throw new ApiError(httpStatus.NOT_FOUND, `Error getting lists of banks`)})

    const banks = await flutter.Bank.country({"country":"NG"})
    res.status(httpStatus.OK).json({
        status: true,
        code: httpStatus.OK,
        message: 'List of Banks retrieved',
        data: banks.data,
      });
});

const resolveAccountNumber = catchAsync(async (req, res) => {
//   const config = {
//       method: 'GET',
//       url: `https://api.paystack.co/bank/resolve?account_number=${req.body.accountNumber}&bank_code=${req.body.bankCode}`,
//       headers: {
//         Authorization: `Bearer ${process.env.PAYSTACK_KEY}`
//     },
//   };

//   const resolvedAccountDetails = await axios(config).then(function (response) {return response.data.data})
//   .catch(error => {throw new ApiError(httpStatus.NOT_FOUND, `Error resolving account number`)})

  const {data} = await flutter.Misc.verify_Account({account_number: req.body.accountNumber,account_bank: req.body.bankCode})
  res.status(httpStatus.OK).json({
      status: true,
      code: httpStatus.OK,
      message: 'List of Banks retrieved',
      data,
    });
});

const createTransaction = catchAsync(async (req, res) => {
    const {userId,recieverName,accountNumber,bankCode,amount,password,transfer} = req.body;
    const {balance} = await getWallet(userId);
    const user = await getUserById(userId);
    console.log('balance, amount',balance,amount)
    if(balance < amount) throw new ApiError(httpStatus.BAD_REQUEST, "You don't have enough balance to perform this transaction");
    if(user.userType === 'sub-admin') throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
    if (!user || !(await user.isPasswordMatch(password))) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect password'); 
    }

    // const {recipient_code} = await transactionService.createTransactionReciept(recieverName,accountNumber,bankCode);
    // console.log("receipt",recipient_code);

    // const {transfer_code,reference} = await transactionService.initiatePayment(amount * 100,recipient_code);

    const {email, phone} = user;
    const reference = `CG${new Date().getTime()}`
    let data = {};
    if(transfer.toLowerCase() === "bank"){
        const charge = await flutter.Charge.ng({
            tx_ref: new Date().getTime(),
            amount,
            account_bank: bankCode,
            account_number: accountNumber,
            currency: "NGN",
            email,
            phone_number: phone,
            fullname: recieverName
        });
        data = charge.data;
    }else{
        const {recipient} = req.body;
        const {firstName, lastName} = user;

        const wallet = await getWalletByAccountNumber(recipient)
        console.log('wallet',wallet)
        await transactionService.updateUserBalance(wallet.userId, amount,'inc')
        const rcpt = await userService.getUserById(wallet.userId)
        req.body.recieverName = `${rcpt ? rcpt.firstName : ''} ${rcpt ? rcpt.lastName : ''}`
        req.body.bankCode = "000";
        req.body.bankName = wallet.bankName;
        data = {
            reference,
            accountNumber: recipient,
            amount,
            recieverName: `${firstName || ''} ${lastName || ''}`
        }
    }

    req.body.reference = reference;
    req.body.txRef = reference;
    req.body.source = 'admin';
    req.body.companyCut = 0;
    req.body.riderCut = 0;

    const transaction = await transactionService.createTransaction(req.body);
    if(transaction) transactionService.updateUserBalance(userId, amount,'dec')

    res.status(httpStatus.CREATED).json({
        status: true,
        code: httpStatus.CREATED,
        message: 'Transfer successful',
        data,
    });
});

const getTransactions = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['status']);
    const options = pick(req.query, ['sortBy', 'limit', 'page','timeFrame','startDate','endDate']);
    // filter.userId = req.params.userId;
    console.log("yo man");
    const data = await transactionService.getTransactions(filter,options);
    res.status(httpStatus.OK).json({
    status: true,
    code: httpStatus.OK,
    message: 'Transactions retrieved',
    data,
    });
});

const getTransaction = catchAsync(async (req, res) => {
    const data = await transactionService.getTransaction(req.params.reference);
    if(!data) throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
    res.status(httpStatus.OK).json({
        status: true,
        code: httpStatus.OK,
        message: 'Transaction info retrieved',
        data,
    });
});

const updateTransactionStatus = catchAsync(async (req, res) => {
    // eslint-disable-next-line prefer-const    
    transactionService.updateTransactionStatus(req.params.transaction_id,req.body);
    res.status(httpStatus.OK).json({
      status: true,
      code: httpStatus.OK,
      message: `Transaction status updated successfully`,
      data: {},
    });
});

const generateNubanAccount = catchAsync(async (req, res) => {
    const { email } = req.params;
    const user = await getUserByEmail(email)
    if(!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    // const checkCustomer = await getCustomer(email)
    // let customer;
    // if(!checkCustomer){
    //     const {firstName,lastName,phone} = user
    //     const c = await transactionService.createCustomer({email,phone,firstname:firstName,lastname:lastName})
    //     customer = c.customer_code
    // }else customer = checkCustomer.customerCode
    // const data = await transactionService.generateNubanAccount(customer);

    const {data} = await flutter.VirtualAcct.create({email,tx_ref: `jhn-mdkn-${new Date().getTime()}`,is_permanent:false})

    console.log('ddd',data)

    const {bank,account_name,account_number,currency} = data
    await transactionService.saveNubanAccount({
        email,
        bank,
        accountName: account_name,
        accountNumber: account_number,
        currency
    });
    
    if(!data) throw new ApiError(httpStatus.BAD_REQUEST, 'Nuban account could not be generated at the moment');
    res.status(httpStatus.OK).json({
        status: true,
        code: httpStatus.OK,
        message: 'Account generated',
        data,
    });
});

const getNubanAccount = catchAsync(async (req, res) => {
    const data = await transactionService.getNubanAccount(req.params.email);
    if(!data) throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
    res.status(httpStatus.OK).json({
        status: true,
        code: httpStatus.OK,
        message: 'Account retrieved',
        data,
    });
});

module.exports = {
    createTransaction,
    listBanks,
    getNubanAccount,
    resolveAccountNumber,
    getTransactions,
    getTransaction,
    updateTransactionStatus,
    generateNubanAccount,
};