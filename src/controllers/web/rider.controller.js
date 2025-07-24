/* eslint-disable no-console */
const httpStatus = require('http-status');
// const Datauri = require('datauri');
// const path = require('path')
const catchAsync = require('../../utils/catchAsync');
const { riderService, orderService, emailService } = require('../../services');
const ApiError = require('../../utils/ApiError');
const pick = require('../../utils/pick');
// const { dataUri } = require('../../utils/multer');

const createHpRider = catchAsync(async (req, res) => {
  const rider = await riderService.createRider(req.body,'hp_rider');
  res.status(httpStatus.CREATED).json({
    status: true,
    code: httpStatus.CREATED,
    message: 'Hp Rider created successfully',
    data: rider,
  });
});

const createDsoRider = catchAsync(async (req, res) => {
  const rider = await riderService.createRider(req.body,'dso_rider');
  res.status(httpStatus.CREATED).json({
    status: true,
    code: httpStatus.CREATED,
    message: 'Dso Rider created successfully',
    data: rider,
  });
});

const getRiders = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['status']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    console.log('the filter is ',filter)
    const riders = await riderService.getRiders(filter,options);
    res.status(httpStatus.CREATED).json({
      status: true,
      code: httpStatus.CREATED,
      message: 'Riders retreived successfully',
      data: riders,
    });
});

const getRider = catchAsync(async (req, res) => {
  const rider = await riderService.getRiderById(req.params.riderId);
  if(!rider){
      throw new ApiError(httpStatus.NOT_FOUND, 'Rider not found');
  }
  res.status(httpStatus.CREATED).json({
    status: true,
    code: httpStatus.CREATED,
    message: 'Rider retreived successfully',
    data: rider,
  });
});

const getRiderOrders = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const filter = pick(req.params, ['riderId']);
  filter.status = 'completed';
  const orders = await orderService.getOrders(filter,options);
  res.status(httpStatus.CREATED).json({
    status: true,
    code: httpStatus.CREATED,
    message: 'Orders retreived successfully',
    data: orders,
  });
});

const getRiderByEmail = catchAsync(async (req, res) => {
    const rider = await riderService.getRiderByEmail(req.params.email);
    if(!rider){
        throw new ApiError(httpStatus.NOT_FOUND, 'Rider not found');
    }
    res.status(httpStatus.CREATED).json({
      status: true,
      code: httpStatus.CREATED,
      message: 'Rider retreived successfully',
      data: rider,
    });
  });

  const updateRider = catchAsync(async (req, res) => {
    const rider = await riderService.updateRider(req.body,req.files);

    const user = await riderService.getRiderByEmail(req.body.email)
    emailService.sendWelcomeEmail(user.email,`Dear ${user.firstName}\n\nYour registration for ${user.type === 'dso_rider' ? 'DSO Carrier registration' : 'CarryGo HP scheme' } has been received.\n\nKindly await a mail invite from us for physical verification within the next three days.\n\nFor more information please contact: 08134890244 (Whatsapp only), info@carrygo.me\n`)
    res.status(httpStatus.CREATED).json({
      status: true,
      code: httpStatus.CREATED,
      message: 'Rider info updated successfully',
      data: rider,
    });
  });

  
const updateRiderStatus = catchAsync(async (req, res) => {
    const rider = await riderService.updateRiderStatus(req.params.riderId,req.body);
    res.status(httpStatus.CREATED).json({
      status: true,
      code: httpStatus.CREATED,
      message: 'Rider status updated successfully',
      data: rider,
    });
});

const availableRiders = catchAsync(async (req, res) => {
  const riders = await orderService.availableRiders(req.params);
  res.status(httpStatus.CREATED).json({
    status: true,
    code: httpStatus.CREATED,
    message: 'Available riders retrieved',
    data: riders,
  });
});

module.exports = {
    createHpRider,
    createDsoRider,
    getRiders,
    getRiderOrders,
    availableRiders,
    updateRider,
    updateRiderStatus,
    getRider,
    getRiderByEmail,
};
