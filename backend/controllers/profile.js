// controllers/profile.js - Profile controllers for FixItNow
// Features: getProfile (populate user/tech data), updateProfile (validate role-specific fields)
// Security: Auth, validate updates (e.g., tech can't update user fields)
// Connections: Models/User, Technician
const User = require('../models/User');
const Technician = require('../models/Technician');
const { body, validationResult } = require('express-validator');

// getProfile - Get user profile (populate tech if role 'tech')
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let profile = await User.findById(userId).select('-referrals.code -loyaltyPoints'); // Hide sensitive

    if (role === 'tech') {
      const tech = await Technician.findOne({ userId }).populate('services', 'name');
      profile = { ...profile.toObject(), tech };
    }

    res.json({ success: true, profile });
  } catch (err) {
    console.error('Get Profile Error:', err);
    res.status(500).json({ msg: 'Failed to get profile', error: err.message });
  }
};

// updateProfile - Update profile (name, phone, email; tech-specific: services, location)
const updateProfile = [
  body('name').optional().isLength({ min: 1, max: 100 }),
  body('phone').optional().isMobilePhone(),
  body('email').optional().isEmail(),
  body('services').optional().isArray().if(body('role').equals('tech')),
  body('lat').optional().isFloat().if(body('role').equals('tech')),
  body('lng').optional().isFloat().if(body('role').equals('tech')),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const role = req.user.role;
      const updates = req.body;

      let profile = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-referrals.code');

      if (role === 'tech' && (updates.services || updates.lat || updates.lng)) {
        const tech = await Technician.findOneAndUpdate(
          { userId },
          {
            ...(updates.services && { services: updates.services }),
            ...(updates.lat && updates.lng && {
              location: {
                type: 'Point',
                coordinates: [updates.lng, updates.lat]
              }
            })
          },
          { new: true }
        ).populate('services', 'name');
        profile = { ...profile.toObject(), tech };
      }

      res.json({ success: true, profile });
    } catch (err) {
      console.error('Update Profile Error:', err);
      res.status(500).json({ msg: 'Failed to update profile', error: err.message });
    }
  }
];

module.exports = { getProfile, updateProfile };