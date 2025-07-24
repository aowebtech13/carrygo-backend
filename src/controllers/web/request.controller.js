const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const pick = require('../../utils/pick');

const { requestService } = require('../../services');

const getRequests = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    // const orders = await requestService.getRequests({userId: req.params.adminId, orderType: 'haulage'},options);
    const orders = await requestService.getRequests({orderType: 'haulage'},options);
    res.status(httpStatus.CREATED).json({
      status: true,
      code: httpStatus.CREATED,
      message: 'Haulage Requests retreived successfully',
      data: orders,
    });
});

const getRequest = catchAsync(async (req, res) => {
  const order = await requestService.getRequest(req.params.orderId);
  res.status(httpStatus.CREATED).json({
    status: true,
    code: httpStatus.CREATED,
    message: 'Haulage Request retreived successfully',
    data: order,
  });
});

const updateRequestStatus = catchAsync(async (req, res) => {
    const user = await requestService.updateRequestStatus(req.params.orderId, req.body);
    res.status(httpStatus.CREATED).json({
      status: true,
      code: httpStatus.CREATED,
      message: 'Review updated successfully',
      data: user,
    });
});

const sendQuotation = catchAsync(async (req, res) => {
    const user = await requestService.sendQuotation(req.body);
    res.status(httpStatus.CREATED).json({
      status: true,
      code: httpStatus.CREATED,
      message: 'Quotation sent successfully',
      data: user,
    });
});

module.exports = {
    getRequests,
    getRequest,
    updateRequestStatus,
    sendQuotation
};
