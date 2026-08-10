/* eslint-disable no-unused-vars */
/* eslint-disable import/order */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable no-use-before-define */
/* eslint-disable prettier/prettier */
const { credentials } = require('../config/variables/config.variable');
var axios = require('axios');


const httpStatus = require('http-status');
const Africastalking = require('africastalking')(credentials);
const moment = require('moment');
const ApiError = require('../utils/ApiError');
const { OTP }  = require('../models');
const { getRndInteger, isExpired } = require('../utils/extras');

/**
 * Send OTP
 * @param {String} recipient
 * @returns {object}
 */

const sendOtp = async(recipient) => {
    // const accountSid = process.env.TWILIO_ACCOUNT_SID;
    // const authToken = process.env.TWILIO_AUTH_TOKEN;
    // eslint-disable-next-line global-require
    // const client = require('twilio')(accountSid, authToken);

    // const send_message = await client.messages
    // .create({
        //     body: `Your OTP from CarryGo App is ${otp}`,
        //     from: recipient.startsWith("+234") ? 'CarryGo' : process.env.TWILIO_MOBILE_NUMBER,
        //     to: recipient
        // });
        // const send_message = await client.verify.services(process.env.SERVICE_ID)
        //          .verifications
        //          .create({to: recipient, channel: 'sms'})
        //          .then(verification => console.log(verification.sid))

    
    const otp = await generateOtp(recipient)
    await sendSmsWithKudi(
        recipient,
        `Use this code: ${otp} to Verify your phone number with CarryGo. Otp expires in 5 minutes`
    )
    return 'send_message';
};

const sendSmsWithKudi = async(recipient, message) =>{
    try {
        const data = new URLSearchParams({
          token: process.env.KUDISMS_API_KEY,
          senderID: process.env.KUDISMS_SENDER_ID,
          recipients: recipient.replace(/^\+/, ''),
          message,
        });

        const url = 'https://my.kudisms.net/api/corporate'

        const response = await axios.post(url, data);
        console.log('Response:', response.data);
      } catch (error) {
        console.error('fail',error.message);
      }

    return true
}

const verifyOtp = async (mobileNumber,otp) => {
    // compare saved otp/mobile number with the incoming one
    const savedOtp = await getUnusedOTP(mobileNumber);
    
    if(!savedOtp){
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid OTP');
    }

    if(savedOtp.otp !== otp){
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');

    }
    const is_expired = isExpired(savedOtp.expires);

    if(is_expired){
        throw new ApiError(httpStatus.UNAUTHORIZED, 'OTP expired already');
    }

    await blacklistOTP(mobileNumber);
    return true;
};

const saveOTP = async (mobileNumber, otp, blacklisted = false) => {
    const expires = moment().add(process.env.OTP_EXPIRATION_TIME, 'minutes');
    const otpDoc =  new OTP({
        mobileNumber,
        otp,
        expires,
        blacklisted,
    });
    otpDoc.save();
    return otpDoc;
};


const getOTP = async(mobileNumber) =>{
    const otp = await OTP.findOne({ mobileNumber });
    if(!otp) return null;
    return otp;
}

const getUnusedOTP = async(mobileNumber) =>{
    const otp = await OTP.findOne({ mobileNumber, blacklisted: false });
    return otp;
}

const updateOTP = async(mobileNumber, payload) =>{
    const updated = await OTP.updateOne({mobileNumber},{"$set":payload})
    if (!updated) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Error creating OTP');
    }
    return updated;
}

const blacklistOTP = async(mobileNumber) =>{
    const blacklisted = await OTP.updateOne({mobileNumber},{"$set":{blacklisted: true}})
    if (!blacklisted) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Error blacklisting OTP');
    }
    return blacklisted;
}

const generateOtp = async(recipient)=>{
    const otp = getRndInteger(100000,999999);
    // save the otp with the mobile number
    const checkOtp = await getOTP(recipient);
    if(!checkOtp){
        // save OTP
        console.log('new otp',recipient, otp)
        await saveOTP(recipient, otp);
    }else{
        // update OTP
        console.log('refresh otp',recipient, otp)
        const expires = moment().add(process.env.OTP_EXPIRATION_TIME, 'minutes')
        await updateOTP(recipient,{
            mobileNumber: recipient,
            otp,
            blacklisted: false,
            expires
        });
    }
    return otp;
}

module.exports = {
    sendOtp,
    verifyOtp,
    generateOtp,
};
