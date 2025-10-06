const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Basic customer routes (using User model for customers)
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, q } = req.query;
    const filter = { role: 'user' };
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ];
    }
    const customers = await User.find(filter)
      .select('name email phone createdAt')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    const total = await User.countDocuments(filter);
    res.json({ success: true, customers, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Failed to fetch customers', error: err.message });
  }
});

router.post('/profile', auth, async (req, res) => {
  // Update customer profile
  res.json({ msg: 'Profile updated' });
});

module.exports = router;