const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const validate = require('../middleware/validate');

// Basic bookings routes (using Job model)
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, userId, techId, from, to } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (techId) filter.techId = techId;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    const bookings = await Job.find(filter)
      .populate('userId', 'name email')
      .populate('techId', 'name rating')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    const total = await Job.countDocuments(filter);
    res.json({ success: true, bookings, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Failed to fetch bookings', error: err.message });
  }
});

router.post('/', auth, validate.bookJob, async (req, res) => {
  // Create booking
  res.json({ msg: 'Booking created' });
});

module.exports = router;