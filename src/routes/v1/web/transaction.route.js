const express = require('express');
const validate = require('../../../middlewares/validate');
const transactionValidation = require('../../../validations/transaction.validation');
const transactionController = require('../../../controllers/web/transaction.controller');
const { checkKey } = require('../../../middlewares/auth');
const { checkPrivileges } = require('../../../middlewares/privilege');

const router = express.Router();

router.get('/banks', checkKey, transactionController.listBanks);
router.post('/bank/resolve', checkKey, validate(transactionValidation.resolveAccountNumber), transactionController.resolveAccountNumber);
router.post('/transfer', checkKey, validate(transactionValidation.createTransaction), transactionController.createTransaction);
router.get('/:userId', checkKey, checkPrivileges('transactions'),validate(transactionValidation.getTransactions), transactionController.getTransactions);
router.get('/info/:reference', checkKey, validate(transactionValidation.getTransaction), transactionController.getTransaction);
router.post('/nuban/create/:email', checkKey, validate(transactionValidation.generateNubanAccount), transactionController.generateNubanAccount);
router.get('/nuban/:email', checkKey, validate(transactionValidation.getNubanAccount), transactionController.getNubanAccount);

module.exports = router;