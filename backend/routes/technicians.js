const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Technician = require('../models/Technician');
const User = require('../models/User');
const ServiceCategory = require('../models/ServiceCategory');
const validate = require('../middleware/validate');

// Basic technician routes
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, q, approved, active, minRating } = req.query;
    const filter = {};
    if (approved === 'true') filter.approved = true;
    if (approved === 'false') filter.approved = false;
    if (active === 'true') filter['availability.status'] = 'available';
    if (active === 'false') filter['availability.status'] = 'busy';
    if (minRating) filter.rating = { $gte: Number(minRating) };

    let query = Technician.find(filter)
      .populate('userId', 'name email phone')
      .populate('services', 'name')
      .sort({ premium: -1, rating: -1, createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    let techs = await query;
    if (q) {
      const needle = String(q).toLowerCase();
      techs = techs.filter(t =>
        (t.userId?.name || '').toLowerCase().includes(needle) ||
        (t.services || []).some(s => (s.name || '').toLowerCase().includes(needle))
      );
    }

    const total = await Technician.countDocuments(filter);
    res.json({ success: true, technicians: techs, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Failed to fetch technicians', error: err.message });
  }
});

router.get('/:id', auth(['admin']), async (req, res) => {
  try {
    const tech = await Technician.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('services', 'name');
    if (!tech) return res.status(404).json({ success: false, msg: 'Technician not found' });
    res.json({ success: true, technician: tech });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Failed to fetch technician', error: err.message });
  }
});

router.post('/register', [auth, validate.registerTech], async (req, res) => {
  // Register technician
  res.json({ msg: 'Technician registered' });
});

// Admin utility: seed a technician profile for a given user email
// POST /api/technicians/seed { email, lat, lng }
router.post('/seed', auth(['admin']), async (req, res) => {
  try {
    const { email, lat = 19.07, lng = 72.87 } = req.body;
    if (!email) return res.status(400).json({ success: false, msg: 'email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, msg: 'User not found for email' });

    // Ensure service category exists
    let svc = await ServiceCategory.findOne({ name: 'General' });
    if (!svc) {
      svc = await ServiceCategory.create({ name: 'General', description: 'General services' });
    }

    // Upsert technician by userId
    let tech = await Technician.findOne({ userId: user._id });
    if (!tech) {
      tech = new Technician({
        userId: user._id,
        services: [svc._id],
        proofs: { aadhar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB' },
        location: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
        rating: 4.5,
        approved: true,
        premium: false,
        availability: { status: 'available' }
      });
      await tech.save();
    } else {
      tech.services = tech.services?.length ? tech.services : [svc._id];
      tech.location = tech.location || { type: 'Point', coordinates: [Number(lng), Number(lat)] };
      tech.approved = true;
      await tech.save();
    }

    return res.json({ success: true, technicianId: tech._id });
  } catch (err) {
    return res.status(500).json({ success: false, msg: 'Failed to seed technician', error: err.message });
  }
});

module.exports = router;