const rateLimit = require('express-rate-limit');
// const MongoDBStore = require('rate-limit-mongo');
const httpStatus = require("http-status");
// const config = require('../config/config');

const authLimiter = rateLimit({
  // store: new MongoDBStore({
  //   uri: config.mongoose.url,
  //   expireTimeMs: 1 * 60 * 1000, // 1 minute,
  //   collectionName: 'rate-limits'
  // }),
  max: 5,
  windowMs: 60 * 1000, // 1 sec
  // keyGenerator(req){
  //   return req.sessionId;
  // },
  message: {
    status: false,
    code: httpStatus.TOO_MANY_REQUESTS,
    message: 'Too may requests from this IP/SessionId, please try again later',
    data: {},
  }
})

// AC697c9619d226276c39c239e107e727f9
// e9a6cae326196f3d4041b49f54036f19

module.exports = {
  authLimiter,
};
