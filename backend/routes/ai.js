const express = require('express');
const router = express.Router();
const { getRecommendations, estimateCost } = require('../controllers/ai');
const auth = require('../middleware/auth');

// Public or auth-protected based on your preference; here we keep them auth-protected
router.get('/recommendations', auth, getRecommendations);
router.post('/estimate-cost', auth, estimateCost);

module.exports = router;
