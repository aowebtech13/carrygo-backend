const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const dsoRoute = require('./dso.route');
const riderRoute = require('./rider.route');
const extrasRoute = require('./extras.route');
const orderRoute = require('./order.route');
const chatRoute = require('./chat.route');
const reviewRoute = require('./review.route');
const requestRoute = require('./request.route');
const dashboardRoute = require('./dashboard.route');
const transactionRoute = require('./transaction.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/dsos',
    route: dsoRoute,
  },
  {
    path: '/riders',
    route: riderRoute,
  },
  {
    path: '/extras',
    route: extrasRoute,
  },
  {
    path: '/orders',
    route: orderRoute,
  },
  {
    path: '/chats',
    route: chatRoute,
  },
  {
    path: '/reviews',
    route: reviewRoute,
  },
  {
    path: '/requests',
    route: requestRoute,
  },
  {
    path: '/dashboard',
    route: dashboardRoute,
  },
  {
    path: '/transactions',
    route: transactionRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
