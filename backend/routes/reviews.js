const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// Basic reviews routes (using Review model)
router.get('/', auth, async (req, res) => {
  try {
    // Placeholder: fetch reviews
    res.json({ msg: 'Reviews list', userId: req.user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, validate.completeJob, async (req, res) => {
  // Create review
  res.json({ msg: 'Review created' });
});

module.exports = router;