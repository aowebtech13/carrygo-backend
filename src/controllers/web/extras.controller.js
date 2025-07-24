/* eslint-disable no-console */
const httpStatus = require('http-status');
const iosStore = require('app-store-scraper');
const ID = require("nodejs-unique-numeric-id-generator");
const googleStore = require('google-play-scraper');
const ApiError = require('../../utils/ApiError');
const cloudinary = require('../../utils/cloudinary');
const catchAsync = require('../../utils/catchAsync');
const pick = require('../../utils/pick');
const { countries } = require('../../config/variables/config.variable');
const { userService, emailService } = require('../../services');
const User = require('../../models/user.model'); 


const uploadDoc = catchAsync(async (req, res) => {
  try {
    const tags = req.body.tags ? req.body.tags : [""];
    const upload = await cloudinary.uploader.upload(req.body.image,
        {
          upload_preset: 'CarryGoFiles',
          tags,
        }
    ).then(fileUploaded => {
      // eslint-disable-next-line no-console
      return fileUploaded;
    })
    .catch(error =>{
      // eslint-disable-next-line no-console
      console.log("error oooo",error);
      throw new ApiError(httpStatus.NOT_FOUND, 'Error uploading image');
    })
  
     res.status(httpStatus.CREATED).json({
      status: true,
      code: httpStatus.CREATED,
      message: 'Image uploaded',
      data: {
        url: upload.url
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("error man=>",error);
    throw new ApiError(httpStatus.NOT_FOUND, 'Error uploading image');
  }
});

const getCountries =  catchAsync(async (req, res) => {
    res.status(httpStatus.OK).json({
        status: true,
        code: httpStatus.OK,
        message: 'Countries retrieved successfully',
        data: countries,
    });
});

const subscribe =  catchAsync(async (req, res) => {
  const data = await userService.subscribe(req.body)
  res.status(httpStatus.OK).json({
      status: true,
      code: httpStatus.OK,
      message: 'Newsletter subscribed',
      data,
  });
});

const getSubscribers =  catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const data = await userService.getSubscribers({},options)
  res.status(httpStatus.OK).json({
      status: true,
      code: httpStatus.OK,
      message: 'Newsletter subscribers',
      data,
  });
});

const sendFeedback =  catchAsync(async (req, res) => {
  const {name, email, subject, message} = req.body;
  const data = await userService.sendFeedback(req.body)
  emailService.sendEmail(process.env.SMTP_SUPPORT, subject, `Feedback from ${name}\n\nEmail: ${email}\nMessage: ${message}`)
  res.status(httpStatus.OK).json({
      status: true,
      code: httpStatus.OK,
      message: 'Feedback sent',
      data,
  });
});

const appStoreData = catchAsync(async (req, res) => {
  const iosAppMeta = await iosStore.app({id: process.env.IOS_APP_ID})
  .then(docs => docs)
  .catch(err => err);

  const googleAppMeta = await googleStore.app({appId: process.env.GOOGLE_PLAY_APP_ID})
  .then(docs => docs)
  .catch(err => err);

  res.status(httpStatus.OK).json({
    status: true,
    code: httpStatus.OK,
    message: 'App data on google playstore and ios',
    data: {
      iosAppMeta,
      googleAppMeta
    },
  });
})

const generateUniqueId = catchAsync(async (req, res) => {
  const users = await User.find()
  users.map(async user =>{
    console.log('user._id',user._id)
    await User.updateOne({_id:user._id},{$set:{uniqueId: ID.generate(new Date().toJSON())}})
    return '';
  })

  res.status(httpStatus.OK).json({
    status: true,
    code: httpStatus.OK,
    message: 'ID generated',
    data: {},
});
})

module.exports = {
  uploadDoc,
  subscribe,
  sendFeedback,
  getCountries,
  getSubscribers,
  generateUniqueId,
  appStoreData
};
