const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const pick = require('../../utils/pick');

const { dashboardService } = require('../../services');

const getOrders = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['orderType', 'timeFrame', 'status']);
    const orders = await dashboardService.getOrders(filter);
    res.status(httpStatus.CREATED).json({
      status: true,
      code: httpStatus.CREATED,
      message: `Orders retrieved`,
      data: orders,
    });
});

const getCharts = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['timeFrame']);
    const charts = await dashboardService.getCharts(filter,req.params.adminId);
    res.status(httpStatus.CREATED).json({
      status: true,
      code: httpStatus.CREATED,
      message: `Charts data retrieved`,
      data: charts,
    });
});

const totalIncome = catchAsync(async (req, res) => {
  const income = await dashboardService.totalIncome();
  
  res.status(httpStatus.CREATED).json({
    status: true,
    code: httpStatus.CREATED,
    message: `Total income retrieved`,
    data: income,
  });
});

module.exports = {
    getOrders,
    getCharts,
    totalIncome
};
