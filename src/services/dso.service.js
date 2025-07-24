/* eslint-disable no-console */
/* eslint-disable no-plusplus */
/* eslint-disable dot-notation */
/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */
const ID = require("nodejs-unique-numeric-id-generator");
const httpStatus = require('http-status');
const { emailService } = require('.');
const DSO = require('../models/dso.model');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const cloudinary = require('../utils/cloudinary');

const { paginate, sortItems, createPassword } = require('../utils/extras');
const { checkUniqueId } = require("./extras.service");

/**
 * Create DSO
 * @param {object} body
 * @returns {String}
 */
const createDSO = async (body) => {
    if (await User.isEmailTaken(body.email)) throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    if (await User.isPhoneNumberTaken(body.phone)) throw new ApiError(httpStatus.BAD_REQUEST, 'Number already exists');
    
    const uniqueId = await checkUniqueId(ID.generate(new Date().toJSON()));
    body.uniqueId = uniqueId
    body.userType = 'dso';
    body.status = "incomplete"
    const user = await User.create(body);
    await createPassword({email:body.email,password:body.password})
    const d = await DSO.create({ userId: user.id });
    console.log(d);
    return user;
};

/**
 * Get DSO
 * @param {object} body
 * @returns {String}
 */
 const getDSOs = async (filter,options) => {
    filter.userType = 'dso';
    const users = await User.find(filter.status ? filter : {...filter, status: {$nin:['deleted','incomplete']}},'-__v -createdAt -updatedAt -password');
    if(!users) return {};
    console.log('users ',users);
    const dsoInfo = users.map(async user =>{
      const dso = await DSO.findOne({userId: user.id}, '-__v -createdAt -updatedAt -_id');
      console.log('dso ',dso);
      const filesCount = dso ? attachmentCount(dso) : 0;
      return {
        dsoId: user._id,
        filesCount,
        ...dso._doc,
        ...user._doc,
      }
    })
  const dsos = await Promise.all(dsoInfo).then(docs => {return docs;})

  if(options.sortBy){
    const sortedDsos = sortItems(dsos,options.sortBy, options.order || '');
    return paginate(sortedDsos,options);;
  }
  return paginate(dsos,options);    
};

/**
* Get Dso by email
* @param {string} email
* @returns {Promise<User>}
*/
const getDSOByEmail = async (email) => {
  const user = await User.findOne({email},'-__v -createdAt -updatedAt -password');
  if(!user) return null;
  const dso = await DSO.findOne({userId: user.id},'-__v -createdAt -updatedAt -_id');
  if(!dso) return null;
  const filesCount = attachmentCount(dso);
  return {
    filesCount,
    ...dso._doc,
    ...user._doc,
  }
 };

 /**
* Get Dso by id
* @param {string} dsoId
* @returns {Promise<User>}
*/
const getDSOById = async (dsoId) => {
  const user = await User.findById(dsoId,'-__v -createdAt -updatedAt -password');
  if(!user) return null;
  const dso = await DSO.findOne({userId: user.id},'-__v -createdAt -updatedAt -_id');
  if(!dso) return null;
  console.log('dso ',dso);
  const filesCount = attachmentCount(dso);
  return {
    filesCount,
    ...dso._doc,
    ...user._doc,
  }
};

/**
* Get Dso by email
* @param {string} email
* @returns {Promise<User>}
*/
const getDSO = async (userId) => {
  return DSO.findOne({ userId });
};

/**
* Get Dso by id
* @param {string} dsoId
* @returns {Promise<User>}
*/
const getDSOViaId = async (dsoId) => {
  return User.findById(dsoId);
};

/**
* Update Dso
* @param {object} updateBody
* @returns {String}
*/
const updateDSO = async (updateBody,fileBody) => {
    console.log('fileBody DSO==>',fileBody);
    const user = await User.findOne({email: updateBody.email});
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'DSO not found');
    const dso = await getDSO(user.id);
    if (!dso) throw new ApiError(httpStatus.NOT_FOUND, 'DSO not found');

    console.log('fileBody[cac]==>',fileBody['cac']);

    // if(fileBody['cac']) updateBody.cac = await uploadDoc(fileBody['cac'][0].path,['cac'],'Cac'); 
    // if(fileBody['hackneyPermit']) updateBody.hackneyPermit = await uploadDoc(fileBody['hackneyPermit'][0].path,['hackneyPermit'],'Hackney Permit');
    if(fileBody['roadWorthiness']) updateBody.roadWorthiness = await uploadDoc(fileBody['roadWorthiness'][0].path,['roadWorthiness'],'Road Worthiness');
    if(fileBody['vehicleReceipt']) updateBody.vehicleReceipt = await uploadDoc(fileBody['vehicleReceipt'][0].path,['vehicleReceipt'],'Vehicle Receipt');
    if(fileBody['idCard']) updateBody.vehicleReceipt = await uploadDoc(fileBody['idCard'][0].path,['idCard'],'Id Card');
 
    Object.assign(dso, updateBody);
    await dso.save();
    if(user.status === "incomplete") Object.assign(user, {status: "pending"});
    await user.save();
   return dso;
};

/**
* Update Dso Status
* @param {object} updateBody
* @param {string} dsoId
* @returns {String}
*/
const updateDSOStatus = async (dsoId,updateBody) => {
   const dso = await getDSOViaId(dsoId);
   if (!dso) {
       throw new ApiError(httpStatus.NOT_FOUND, 'DSO not found');
   }

   let message;
   const {email,firstName} = dso
   if(updateBody.status.toLowerCase() === "approved"){
    if(dso.status === 'pending'){
      message =`Hi ${firstName},\n\nCongratulations, Your DSO verification on the CarryGo Service Platform has been confirmed Successful; Welcome onboard.\n\nBest regards.\nCarryGo TEAM\n`
    }
     // dso currenly blocked, but about to be unblocked 
    message =`Hi ${firstName},\n\nYour restriction on the CarryGo App service has been suspended\n\nWelcome Back !!!\nCarryGo TEAM\n`

    emailService.userVerified(email,message)
    Object.assign(dso, updateBody);
    await dso.save();
    return dso;
   }
   if(updateBody.status.toLowerCase() === "blocked"){
    message =`Hi ${firstName},\n\nThis is to inform you that you have been suspended from the carrygo service for violation of our user policy/terms and conditions.\n\nTo inquire into your suspension and possible resolution please contact: 08134890244 (Whatsapp only), email: info @carrygo.me\n\nBest Regards\nCarryGO Team\n`;

    emailService.userVerified(email,message)
    Object.assign(dso, updateBody);
    await dso.save();
    return dso;
   }
   if(updateBody.status.toLowerCase() === "deleted") {
    const dt = await User.deleteOne({_id: dsoId});
    await DSO.deleteOne({userId: dsoId});
    console.log('deleted', dt);
    return {}
  }
};

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

const attachmentCount = (dso) =>{
  let count = 0;
  if(dso.cac){
     count++;
  } 
  if(dso.roadWorthiness){
    count++;
  }
  if(dso.hackneyPermit){
    count++;
  }
  if(dso.vehicleReceipt){
     count++;
  }
  return count;
} 

module.exports = {
    createDSO,
    getDSOs,
    getDSOByEmail,
    getDSOById,
    updateDSO,
    updateDSOStatus,
};
