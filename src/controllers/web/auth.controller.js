const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { authService, userService, tokenService, emailService, otpService, extrasService } = require('../../services');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).json({
    status: true,
    code: httpStatus.CREATED,
    message: 'Admin registered successfully',
    data: {user,tokens},
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password, ipAddress } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password, ipAddress);
  if(user.status === 'suspended') throw new ApiError(httpStatus.UNAUTHORIZED, 'User currently suspended');
  if(user.userType === 'dso') throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.OK).json({
    status: true,
    code: httpStatus.OK,
    message: 'User logged in successfully',
    data: {user,tokens},
  });
});

const logout = catchAsync(async (req, res) => {
  const {refreshToken,userId} = req.body;
  extrasService.deleteLoggedAdmin(userId)
  await authService.logout(refreshToken);
  res.status(httpStatus.OK).json({
    status: true,
    code: httpStatus.OK,
    message: 'User logged out successfully',
    data: {},
  });
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.status(httpStatus.OK).json({
    status: true,
    code: httpStatus.OK,
    message: 'Token refreshed',
    data: { ...tokens },
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.OK).json({
    status: true,
    code: httpStatus.OK,
    message: `Email sent to ${req.body.email}`,
    data: {},
  });
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.OK).json({
    status: true,
    code: httpStatus.OK,
    message: 'Password reset',
    data: {},
  });
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.OK).json({
    status: true,
    code: httpStatus.OK,
    message: `Email verificaton sent to ${req.user.email}`,
    data: {},
  });
});

const sendOtpEmail = catchAsync(async (req, res) => {
  const otp = await otpService.generateOtp(req.body.email)
  await emailService.sendgridOtpEmail(req.body.email,otp);
  res.status(httpStatus.OK).json({
    status: true,
    code: httpStatus.OK,
    message: `Email verificaton sent to ${req.body.email}`,
    data: {},
  });
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.OK).json({
    status: true,
    code: httpStatus.OK,
    message: 'Verify email',
    data: {},
  });
});

const verifyOtpEmail = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const verify = await otpService.verifyOtp(email,otp);

  if(!verify){
      throw new ApiError(httpStatus.BAD_REQUEST, 'Error verifying OTP');
  }

  res.status(httpStatus.CREATED).json({
      status: true,
      code: httpStatus.CREATED,
      message: 'OTP verified successfully',
      data: {
        email
      },
  })
});

const sendOtp = catchAsync(async (req, res) => {
  const { mobileNumber } = req.body;
  // if (await User.isPhoneNumberTaken(mobileNumber)) throw new ApiError(httpStatus.BAD_REQUEST, 'Number already exists');

  const otp = await otpService.sendOtp(mobileNumber);
  if(!otp) throw new ApiError(httpStatus.BAD_REQUEST, 'Error sending OTP');

  res.status(httpStatus.OK).json({
      status: true,
      code: httpStatus.OK,
      message: 'OTP sent',
      data: {mobileNumber},
  });
});

const verifyOtp = catchAsync(async (req, res) => {
  const { mobileNumber, otp } = req.body;
  const verify = await otpService.verifyOtp(mobileNumber,otp);

  if(!verify){
      throw new ApiError(httpStatus.BAD_REQUEST, 'Error verifying OTP');
  }

  res.status(httpStatus.CREATED).json({
      status: true,
      code: httpStatus.CREATED,
      message: 'OTP verified successfully',
      data: {
        mobileNumber
      },
  })
});

module.exports = {
  verifyOtp,
  sendOtp,
  register,
  login,
  logout,
  verifyOtpEmail,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendOtpEmail,
  sendVerificationEmail,
  verifyEmail,
};
