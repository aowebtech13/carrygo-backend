/* eslint-disable no-plusplus */
/* eslint-disable no-unused-vars */
/* eslint-disable dot-notation */
/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
const ID = require("nodejs-unique-numeric-id-generator");
const httpStatus = require('http-status');
const { Wallet } = require('../models');
const Rider = require('../models/rider.model');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const cloudinary = require('../utils/cloudinary');
const { paginate, sortItems, createPassword } = require('../utils/extras');
const { checkUniqueId } = require("./extras.service");
const { emailService } = require(".");

/**
 * Create Rider
 * @param {object} body
 * @returns {String}
 */
const createRider = async (body, type) => {
    if (await User.isEmailTaken(body.email)) throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    if (await User.isPhoneNumberTaken(body.phone)) throw new ApiError(httpStatus.BAD_REQUEST, 'Number already exists');
    
    body.userType = 'rider';
    body.status = 'incomplete';
    const uniqueId = await checkUniqueId(ID.generate(new Date().toJSON()));
    body.uniqueId = uniqueId
    const user = await User.create(body);
    await createPassword({email:body.email,password:body.password})
    await Rider.create({userId: user.id,type, dsoId: body.dsoId || ''});
    Wallet.create({userId: user.id});
    return user
};

/**
 * Get Rider
 * @param {object} body
 * @returns {String}
 */
 const getRiders = async (filter,options) => {
    filter.userType = 'rider';
    const users = await User.find(filter.status ? filter : {...filter, status: {$nin:['deleted','incomplete']}},'-__v -createdAt -updatedAt -password');
    const riderInfo = users.map(async user =>{
      const rider = await Rider.findOne({userId: user.id}, '-__v -createdAt -updatedAt -_id');
      const filesCount = rider ? attachmentCount(rider) : 0;

      // delete rider._doc.status
      return {
        riderId: user._id,
        filesCount,
        ...(rider?._doc || {}),
        ...(user._doc || {})
      }
    })
    const riders = await Promise.all(riderInfo).then(docs => {return docs;})

    if(options.sortBy){
      const sortedRiders = sortItems(riders,options.sortBy, options.order || '');
      return paginate(sortedRiders,options);;
    }
    return paginate(riders,options);    
}  

/**
 * Get rider by email
 * @param {string} email
 * @returns {Promise<User>}
 */
 const getRiderByEmail = async (email) => {
  const user = await User.findOne({email},'-__v -createdAt -updatedAt -password');
  if(!user) return null;
  const rider = await Rider.findOne({userId: user.id},'-__v -createdAt -updatedAt -_id');
  if(!rider) return null;
  const filesCount = attachmentCount(rider);
  const {online} = rider._doc;
  return {
    filesCount,
    ...rider._doc,
    ...user._doc,
    online,
  }
};

  /**
 * Get rider by id
 * @param {string} riderId
 * @returns {Promise<User>}
 */
 const getRiderById = async (riderId) => {
  const user = await User.findById(riderId,'-__v -createdAt -updatedAt -password');
  if(!user) return null;
  const rider = await Rider.findOne({userId: user.id},'-__v -createdAt -updatedAt -_id');
  if(!rider) return null;
  const filesCount = attachmentCount(rider);
  const {online} = rider._doc;
  return {
    filesCount,
    ...rider._doc,
    ...user._doc,
    online
  }
};

/**
 * Get rider by email
 * @param {string} email
 * @returns {Promise<User>}
 */
 const getRider = async (userId) => {
  return Rider.findOne({ userId });
};

/**
* Get rider by id
* @param {string} riderId
* @returns {Promise<User>}
*/
const getRiderViaId = async (riderId) => {
  return User.findById(riderId);
};

/**
 * Update Rider
 * @param {object} updateBody
 * @returns {String}
 */
 const updateRider = async (updateBody,fileBody) => {
    console.log('fileBody RIDER==>',fileBody);

    const user = await User.findOne({email: updateBody.email});
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'Rider not found');
    const rider = await getRider(user.id);
    if (!rider) throw new ApiError(httpStatus.NOT_FOUND, 'Rider not found');

    // console.log('fileBody[vehicleReceipt]==>',fileBody['vehicleReceipt']);

    if(fileBody['healthCertificate']) updateBody.healthCertificate =  await uploadDoc(fileBody['healthCertificate'][0].path,['healthCertificate'],'Health Certificate');
    if(fileBody['idCard']) updateBody.idCard =  await uploadDoc(fileBody['idCard'][0].path,['idCard'],'Id Card');
    if(fileBody['passport']) updateBody.passport =  await uploadDoc(fileBody['passport'][0].path,['passport'],'Passport');
    if(fileBody['originCertificate']) updateBody.originCertificate =  await uploadDoc(fileBody['originCertificate'][0].path,['originCertificate'],'Certification of Origin');
    if(fileBody['lasra']) updateBody.lasra =  await uploadDoc(fileBody['lasra'][0].path,['lasra'],'Lasra');
    if(fileBody['guarantorForm']) updateBody.guarantorForm =  await uploadDoc(fileBody['guarantorForm'][0].path,['guarantorForm'],'Guarantor Form');
    if(fileBody['academicCredentials']) updateBody.academicCredentials =  await uploadDoc(fileBody['academicCredentials'][0].path,['academicCredentials'],'Academic Credentials');
    if(fileBody['roadWorthiness']) updateBody.roadWorthiness =  await uploadDoc(fileBody['roadWorthiness'][0].path,['roadWorthiness'],'Road Worthiness');
    if(fileBody['vehicleReceipt']) updateBody.vehicleReceipt =  await uploadDoc(fileBody['vehicleReceipt'][0].path,['vehicleReceipt'],'Vehicle Receipt');
    
    Object.assign(rider, updateBody);
    await rider.save();
    if(user.status === "incomplete") Object.assign(user, {status: "pending"});
    await user.save();
    return rider;
};

/**
 * Update Rider Status
 * @param {object} updateBody
 * @param {string} riderId
 * @returns {String}
 */

 const updateRiderStatus = async (riderId,updateBody) => {
    console.log({riderId})
    console.log({updateBody})
    const rider = await getRiderViaId(riderId);
    if (!rider) throw new ApiError(httpStatus.NOT_FOUND, 'Rider not found');
    console.log('the rider ',rider);
    let message; let title;
    const rdr = await Rider.findOne({userId: rider._id})
    const {email, firstName} = rider;
    if(updateBody.status.toLowerCase() === "blocked") {
      title = 'Rider Suspended';
      message = `Hi ${firstName}\n\nThis is to inform you that you have been suspended from the carrygo service for violation of our user policy/terms and conditions.\n\nTo inquire into your suspension and possible resolution please contact: 08134890244 (Whatsapp only), email: info @carrygo.me\n\nBest Regards\nCarryGO Team\n`;

      if(message) emailService.userVerified(email,message,title);
      Object.assign(rider, updateBody);
      await rider.save();
      return rider;
    }
    if(updateBody.status.toLowerCase() === "approved") {
      console.log('updateBody.status.',updateBody.status)
      if(rider.status === 'blocked'){
      title = 'Rider Unsuspended';
        message = `Hi ${firstName}\n\nYour restriction on the CarryGo App service has been suspended\nWelcome Back !!!\n\nCarryGo Team\n`;
      }else if(rdr && rdr.status === 'pending'){
        title = 'Welcome Aboard';
        if(rdr && rdr.type === 'dso_rider'){
          message = `Hi ${firstName}\n\nCongratulations, Your DSO Rider verification on the CarryGo Service Platform has been confirmed Successful; Welcome onboard.\n\nBest regards.\nCarryGo TEAM\n`
        }else{
          message = `Hi ${firstName}\n\nCongratulations, Your Hired Purchase Carrier verification on the CarryGo Service Platform has been confirmed Successful; Welcome onboard.\n\nBest regards.\nCarryGo TEAM\n`;
        }
      }
      Wallet.create({userId: riderId}) 

      if(message) emailService.userVerified(email,message,title);
      Object.assign(rider, updateBody);
      await rider.save();
      return rider;
    }
    if(updateBody.status.toLowerCase() === "deleted") {
      // User.findByIdAndUpdate(riderId,{status:'deleted', deleted_at: new Date()});
      // console.log('about to delete rider', await User.findById(riderId));
      const dt = await User.deleteOne({_id: riderId});
      await Rider.deleteOne({userId: riderId});
      console.log('deleted', dt);
      return {} 
    }
    
};

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

const uploadDoc = async (imageString,tags,fieldName) => {
    try {
    //   console.log('the iamge string ',imageString);
    if(imageString){
        const imageUrl = await cloudinary.uploader.upload(imageString,
            {
              upload_preset: 'CarryGoFiles',
              tags,
            }
        ).then(fileUploaded => {
          // eslint-disable-next-line no-console
          return fileUploaded.url;
        })
        .catch(error =>{
          // eslint-disable-next-line no-console
          console.log("error oooo",error);
          throw new ApiError(httpStatus.NOT_FOUND, `Error uploading ${fieldName}`);
        })
      
        return imageUrl;
    }
    return '';
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("error man=>",error);
      throw new ApiError(httpStatus.NOT_FOUND, 'Error uploading image');
    }
};

module.exports = {
    createRider,
    getRiders,
    updateRider,
    updateRiderStatus,
    getRiderByEmail,
    getRiderById
};
