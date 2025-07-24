const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const pick = require('../../utils/pick');
const { chatService } = require('../../services');

const sendMessage = catchAsync(async (req, res) => {
  const message = await chatService.sendMessage(req.body);
  res.status(httpStatus.CREATED).json({
    status: true,
    code: httpStatus.CREATED,
    message: 'Message sent successfully',
    data: message,
  });
});

const getMessages = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const messages = await chatService.getMessages(req.params.chatId,options);
    res.status(httpStatus.CREATED).json({
      status: true,
      code: httpStatus.CREATED,
      message: 'Messages retreived successfully',
      data: messages,
    });
});

const getMessagesByUser = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const messages = await chatService.getMessagesByUser(req.params.adminId,req.params.customerId,options);
  res.status(httpStatus.CREATED).json({
    status: true,
    code: httpStatus.CREATED,
    message: 'Messages retrieved successfully',
    data: messages,
  });
});

const readMessage = catchAsync(async (req, res) => {
  await chatService.readMessage(req.params.adminId,req.params.customerId, req.params.readerId);
  res.status(httpStatus.CREATED).json({
    status: true,
    code: httpStatus.CREATED,
    message: 'Messages read successfully',
    data: {},
  });
});

const getChats = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const chats = await chatService.getChats(req.params.userId,options);
    res.status(httpStatus.CREATED).json({
        status: true,
        code: httpStatus.CREATED,
        message: 'Chats retrieved successfully',
        data: chats,
    });
});

module.exports = {
    sendMessage,
    getMessages,
    getChats,
    getMessagesByUser,
    readMessage,
};
