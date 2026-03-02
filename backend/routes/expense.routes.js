const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const { auth } = require('../middleware/auth');

router.post('/', auth, expenseController.createExpense);
router.get('/', auth, expenseController.getExpenses);

module.exports = router;
