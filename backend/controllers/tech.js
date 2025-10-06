// tech.js - Controllers for technician role in FixItNow MERN app
// Features: register (Aadhar upload via Multer, admin approval pending), accept/decline jobs, set freeze mode (in-memory demo), confirm COD payment, initiate video call
// Security: Auth middleware (role 'tech'), validation, Multer for secure file upload (base64 limit 5MB)
// Connections: Models/Technician, Job, Activity; Socket.io for realtime events

const Technician = require('../models/Technician');
const Job = require('../models/Job');
const Activity = require('../models/Activity');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');

// In-memory storage for demo
const techStatus = new Map();

// Multer setup for Aadhar upload (memory storage for base64, limit 5MB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image/PDF allowed for Aadhar'), false);
    }
  }
});

// register - Tech registration with OTP verification and Aadhar upload
// Params: phone/email (from auth), services, location, aadhar file
// On success: Create Technician (approved: false), queue email for verification, log Activity
const register = [
  upload.single('aadhar'), // Multer middleware for file
  // Validation
  body('services').isArray({ min: 1 }),
  body('lat').optional().isFloat(),
  body('lng').optional().isFloat(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { phone, email, services, lat, lng, role = 'tech' } = req.body;
      const userId = req.user.id; // From auth middleware (after OTP)

      // Convert file to base64 if uploaded
      let aadharBase64;
      if (req.file) {
        aadharBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }

      // Create Technician
      const tech = new Technician({
        userId, // Link to User
        services: JSON.parse(services), // Array from form
        proofs: { aadhar: aadharBase64 },
        location: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        rating: 0,
        premium: false,
        approved: false // Pending admin approval
      });
      await tech.save();

      // Log activity
      await Activity.logActivity('tech_register', userId, { techId: tech._id, services });

      res.json({ success: true, msg: 'Technician registered. Awaiting admin approval.', techId: tech._id });
    } catch (err) {
      console.error('Tech Register Error:', err);
      res.status(500).json({ success: false, msg: 'Registration failed', error: err.message });
    }
  }
];

// acceptJob - Accept job, update Job status to 'in-progress', set Redis busy, notify user
const acceptJob = [
  body('jobId').isMongoId(),
  async (req, res) => {
    try {
      const { jobId } = req.params;
      const userId = req.user.id;
      // Resolve technician by linked user account
      const techDoc = await Technician.findOne({ userId });
      if (!techDoc) return res.status(404).json({ msg: 'Technician profile not found' });

      const job = await Job.findById(jobId);
      if (!job || job.techId.toString() !== String(techDoc._id)) {
        return res.status(400).json({ msg: 'Invalid job or not assigned to you' });
      }

      if (job.status !== 'pending') {
        return res.status(400).json({ msg: 'Job is no longer pending' });
      }

      // Update job status
      job.status = 'in-progress';
      await job.updateStatus('in-progress', req.io); // Emit to user via Socket.io

      // Update tech availability in memory
      techStatus.set(`tech:${techDoc._id}:busy`, 'in-progress');
      setTimeout(() => techStatus.delete(`tech:${techDoc._id}:busy`), 2 * 60 * 60 * 1000);

      // Log
      await Activity.logActivity('job_accepted', userId, { jobId });

      res.json({ success: true, job });
    } catch (err) {
      console.error('Accept Job Error:', err);
      res.status(500).json({ success: false, msg: 'Failed to accept job', error: err.message });
    }
  }
];

// declineJob - Decline job, update status to 'declined', notify user/admin
const declineJob = [
  body('jobId').isMongoId(),
  async (req, res) => {
    try {
      const { jobId } = req.params;
      const userId = req.user.id;
      const techDoc = await Technician.findOne({ userId });
      if (!techDoc) return res.status(404).json({ msg: 'Technician profile not found' });

      const job = await Job.findById(jobId);
      if (!job || job.techId.toString() !== String(techDoc._id)) {
        return res.status(400).json({ msg: 'Invalid job or not assigned to you' });
      }

      job.status = 'declined';
      await job.save();

      // Emit to user
      req.io.to(job.userId).emit('jobUpdate', { jobId, status: 'declined', reason: 'declined by tech' });

      // Log
      await Activity.logActivity('job_declined', userId, { jobId });

      res.json({ success: true, msg: 'Job declined' });
    } catch (err) {
      console.error('Decline Job Error:', err);
      res.status(500).json({ success: false, msg: 'Failed to decline job', error: err.message });
    }
  }
];

// setFreezeMode - Set tech busy status in Redis (e.g., during job, 3-hour lock)
// Params: duration in minutes (optional, default 180 min for job)
const setFreezeMode = [
  body('duration').optional().isInt({ min: 1 }),
  async (req, res) => {
    try {
      const { duration = 180 } = req.body; // minutes
      const userId = req.user.id;
      const tech = await Technician.findOne({ userId });
      if (!tech) return res.status(404).json({ msg: 'Technician not found' });

      // Set busy in memory
      const key = `tech:${tech._id}:busy`;
      techStatus.set(key, 'frozen');
      setTimeout(() => techStatus.delete(key), duration * 60 * 1000);

      // Update model nextAvailable
      tech.availability.status = 'busy';
      tech.availability.nextAvailable = new Date(Date.now() + duration * 60 * 1000);
      await tech.save();

      // Log
      await Activity.logActivity('freeze_mode_set', userId, { duration });

      res.json({ success: true, nextAvailable: tech.availability.nextAvailable });
    } catch (err) {
      console.error('Freeze Mode Error:', err);
      res.status(500).json({ success: false, msg: 'Failed to set freeze mode', error: err.message });
    }
  }
];

// initiateVideoCall - Generate unique videoCallId for WebRTC, update Job, emit to user
const initiateVideoCall = [
  body('jobId').isMongoId(),
  async (req, res) => {
    try {
      const { jobId } = req.params;
      const userId = req.user.id;
      const techDoc = await Technician.findOne({ userId });
      if (!techDoc) return res.status(404).json({ msg: 'Technician profile not found' });

      const job = await Job.findById(jobId);
      if (!job || job.techId.toString() !== String(techDoc._id)) {
        return res.status(400).json({ msg: 'Invalid job' });
      }

      // Generate unique ID for WebRTC (use crypto or UUID)
      const videoCallId = crypto.randomUUID();

      job.videoCallId = videoCallId;
      await job.save();

      // Emit to user for WebRTC setup
      req.io.to(job.userId).emit('videoCallInitiated', { jobId, videoCallId });

      res.json({ success: true, videoCallId });
    } catch (err) {
      console.error('Video Call Error:', err);
      res.status(500).json({ success: false, msg: 'Failed to initiate video call', error: err.message });
    }
  }
];

// premiumUpgrade - Request premium subscription (admin approves, but tech can initiate request)
const premiumUpgrade = [
  async (req, res) => {
    try {
      const userId = req.user.id;
      const tech = await Technician.findOne({ userId });
      if (!tech) return res.status(404).json({ msg: 'Technician not found' });

      // For now, toggle (in production, integrate payment gateway for subscription)
      tech.premium = true;
      await tech.save();

      // Log
      await Activity.logActivity('premium_upgrade', userId, { status: 'activated' });

      res.json({ success: true, premium: tech.premium });
    } catch (err) {
      console.error('Premium Upgrade Error:', err);
      res.status(500).json({ msg: 'Failed to upgrade premium', error: err.message });
    }
  }
];

const getNearbyTechnicians = async (req, res) => {
  try {
    const { lat, lng, service, radius = 50000, minRating = 0, q } = req.query; // radius in m
    if (!lat || !lng) {
      return res.status(400).json({ msg: 'lat and lng required' });
    }

    const geoFilter = {
      'location.type': 'Point',
      'location.coordinates': {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius)
        }
      }
    };

    const baseFilter = {
      approved: true,
      ...geoFilter,
      ...(service ? { services: service } : {}),
      ...(minRating ? { rating: { $gte: Number(minRating) } } : {}),
    };

    // Optional text-like filter using services name requires populate then filter, or maintain a denormalized field
    let techs = await Technician.find(baseFilter)
      .populate('services', 'name')
      .populate('userId', 'name')
      .limit(100);

    if (q) {
      const needle = String(q).toLowerCase();
      techs = techs.filter(t => (t.services || []).some(s => (s.name || '').toLowerCase().includes(needle)));
    }

    res.json({ success: true, technicians: techs });
  } catch (err) {
    console.error('Nearby Tech Error:', err);
    res.status(500).json({ success: false, msg: 'Failed to find technicians', error: err.message });
  }
};

// Toggle active status (available/busy)
const setActiveStatus = async (req, res) => {
  try {
    const userId = req.user.id; // user account id
    const { active } = req.body; // boolean
    // Find technician profile by linked userId
    const tech = await Technician.findOne({ userId });
    if (!tech) return res.status(404).json({ success: false, msg: 'Technician profile not found for this account' });
    tech.availability = tech.availability || {};
    tech.availability.status = active ? 'available' : 'busy';
    await tech.save();
    await Activity.logActivity('tech_active_toggle', userId, { status: tech.availability.status });
    return res.json({ success: true, status: tech.availability.status });
  } catch (err) {
    console.error('Set Active Error:', err);
    return res.status(500).json({ success: false, msg: 'Failed to update status', error: err.message });
  }
};

module.exports = {
  register,
  acceptJob,
  declineJob,
  setFreezeMode,
  initiateVideoCall,
  premiumUpgrade,
  getNearbyTechnicians,
  setActiveStatus
};