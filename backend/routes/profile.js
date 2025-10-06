const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profile');
const auth = require('../middleware/auth');

// All routes require auth
router.use(auth());

// GET /api/profile - Get profile
router.get('/', getProfile);

// PUT /api/profile - Update profile
router.put('/', updateProfile);

module.exports = router;