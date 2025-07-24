/* eslint-disable no-console */
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { dsoService, emailService} = require('../../services');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');

const createDSO = catchAsync(async (req, res) => {
  const user = await dsoService.createDSO(req.body);
  res.status(httpStatus.CREATED).json({
    status: true,
    code: httpStatus.CREATED,
    message: 'DSO created successfully',
    data: user,
  });
});

const getDSOs = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['status']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const dso = await dsoService.getDSOs(filter,options);
    res.status(httpStatus.CREATED).json({
      status: true,
      code: httpStatus.CREATED,
      message: 'DSOs retreived successfully',
      data: dso,
    });
});

const getDSO = catchAsync(async (req, res) => {
    const dso = await dsoService.getDSOById(req.params.dsoId);
    if(!dso){
        throw new ApiError(httpStatus.NOT_FOUND, 'DSO not found');
     }
    res.status(httpStatus.CREATED).json({
      status: true,
      code: httpStatus.CREATED,
      message: 'DSO retreived successfully',
      data: dso,
    });
});

const getDSOByEmail = catchAsync(async (req, res) => {
    const dso = await dsoService.getDSOByEmail(req.params.email);
    if(!dso){
       throw new ApiError(httpStatus.NOT_FOUND, 'DSO not found');
    }
    res.status(httpStatus.CREATED).json({
      status: true,
      code: httpStatus.CREATED,
      message: 'DSO retreived successfully',
      data: dso,
    });
});

const updateDSO = catchAsync(async (req, res) => {
    console.log("req.files ",req.files);
    
    const dso = await dsoService.updateDSO(req.body,req.files);
    // const tokens = await tokenService.generateAuthTokens(dso);
    // console.log('na the dso be this man ',dso);
    const d = await dsoService.getDSOByEmail(dso.email);
    console.log("the d man",d)

    if(req.body.registration === 'completed'){
      emailService.sendWelcomeEmail(dso.email,
        `
Dear ${d.companyName || d.firstName}
        
Your registration for CarryGo DSO scheme has been received.
  
Kindly await a mail invite from us for physical verification within the next three days.
For more information please contact: 08134890244 (Whatsapp only), info@carrygo.me
      `,'Registration Successful')
    }
    res.status(httpStatus.CREATED).json({
      status: true,
      code: httpStatus.CREATED,
      message: 'DSO info updated successfully', 
      data: dso,
    });
});

const updateDSOStatus = catchAsync(async (req, res) => {
    const dso = await dsoService.updateDSOStatus(req.params.dsoId,req.body);
    res.status(httpStatus.CREATED).json({
      status: true,
      code: httpStatus.CREATED,
      message: 'DSO statis updated successfully',
      data: dso,
    });
});

module.exports = {
    createDSO,
    getDSOs,
    getDSO,
    getDSOByEmail,
    updateDSO,
    updateDSOStatus,
};
