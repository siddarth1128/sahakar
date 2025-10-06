const express = require('express');
const router = express.Router();
const { createPaymentIntent } = require('../controllers/payments');
const auth = require('../middleware/auth');

router.post('/create-intent', auth, createPaymentIntent);

module.exports = router;