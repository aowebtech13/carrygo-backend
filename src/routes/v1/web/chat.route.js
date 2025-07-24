const express = require('express');
const validate = require('../../../middlewares/validate');
const chatValidation = require('../../../validations/chat.validation');
const chatController = require('../../../controllers/web/chat.controller');
const { checkKey } = require('../../../middlewares/auth');


const router = express.Router();

router.get('/messages/:chatId', checkKey, validate(chatValidation.getMessages), chatController.getMessages);
router.get('/:userId', checkKey, validate(chatValidation.getChats), chatController.getChats);
router.post('/message/send', checkKey, validate(chatValidation.sendMessage), chatController.sendMessage);

router.get('/messages/:adminId/:customerId', checkKey, validate(chatValidation.getMessagesByUser), chatController.getMessagesByUser);
router.put('/messages/read/:adminId/:customerId/:readerId', checkKey, validate(chatValidation.readMessage), chatController.readMessage);

module.exports = router;