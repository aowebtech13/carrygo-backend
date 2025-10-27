require('newrelic'); // imports newrelic

const inspector = require('@inspector-apm/inspector-nodejs')({
  ingestionKey: process.env.INSPECTOR_API_KEY,
});


const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const mobileRoutes = require('./routes/v1/mobile');
const webRoutes = require('./routes/v1/web');


require('./utils/websocket'); // imports the websocket
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json({ limit: '100mb' }));

// parse urlencoded request body
app.use(express.urlencoded({ extended: true, limit: '100mb', parameterLimit: 10000000 }));

// Inspecto middleware
app.use(inspector.expressMiddleware());

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// api rate limit
app.use(authLimiter);

// v1 api routes
app.use('/v1/mobile', mobileRoutes);
app.use('/v1/web', webRoutes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
