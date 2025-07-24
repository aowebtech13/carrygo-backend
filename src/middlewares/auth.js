/* eslint-disable no-unused-vars */
const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;

  resolve();
};

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

const checkKey = (req, res, next) => {
  try {
    const signature = req.headers['cg-key'];
    if (signature === process.env.CG_KEY) {
      next();
    } else {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid cg-key provided'));
    }
  } catch (error) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid cg-key provided'));
  }
};

module.exports = {
  auth,
  checkKey,
};
