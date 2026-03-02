const express = require('express');
const router = express.Router();
const saleController = require('../controllers/sale.controller');
const { auth } = require('../middleware/auth');

router.post('/', auth, saleController.createSale);
router.get('/', auth, saleController.getSales);

module.exports = router;
