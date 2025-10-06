// controllers/job.js - Job management controllers for FixItNow MERN app
// Features: create jobs (from booking), update status (pending/in-progress/completed), complete with reviews (weighted average), send notifications (email/SMS via Redis queue)
// Security: Auth middleware, validation
// Connections: Models/Job, Technician, Activity; Redis for queues; Socket.io for real-time updates
// Real-time: Status updates emit to user/tech, notifications queued
const Job = require('../models/Job');
const Technician = require('../models/Technician');
const Activity = require('../models/Activity');
const { body, validationResult } = require('express-validator');

// In-memory storage for demo
const notifications = [];

// createJob - Create job from booking (called from user.js bookJob, but separate for flexibility)
const createJob = async (req, res) => {
  try {
    const { userId, techId, price, beneficiaryName, beneficiaryPhone, serviceType, description } = req.body;
    const job = new Job({
      userId,
      techId,
      price,
      beneficiaryName,
      beneficiaryPhone,
      serviceType,
      description
    });
    await job.save();

    // Log activity
    await Activity.logActivity('job_created', userId, { jobId: job._id, techId });

    res.json({ success: true, job });
  } catch (err) {
    console.error('Create Job Error:', err);
    res.status(500).json({ msg: 'Failed to create job', error: err.message });
  }
};

const createJobValidation = [
  body('userId').isMongoId(),
  body('techId').isMongoId(),
  body('price').isNumeric(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// updateStatus - Update job status (admin/tech/user, depending on role)
const updateStatus = async (req, res) => {
  try {
    const { jobId, status } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    // Permission check: user can cancel, tech can update to in-progress/completed, admin can all
    if (role === 'user' && status !== 'cancelled') return res.status(403).json({ msg: 'Unauthorized' });
    if (role === 'tech') {
      const Technician = require('../models/Technician');
      const techDoc = await Technician.findOne({ userId }).select('_id');
      if (!techDoc || job.techId.toString() !== String(techDoc._id)) {
        return res.status(403).json({ msg: 'Not your job' });
      }
    }

    await job.updateStatus(status, req.io);

    // Log notification
    console.log(`Job ${jobId} status updated to ${status}`);

    // Log
    await Activity.logActivity('job_status_updated', userId, { jobId, status });

    res.json({ success: true, job });
  } catch (err) {
    console.error('Update Status Error:', err);
    res.status(500).json({ msg: 'Failed to update status', error: err.message });
  }
};

const updateStatusValidation = [
  body('jobId').isMongoId(),
  body('status').isIn(['pending', 'in-progress', 'completed', 'cancelled']),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// completeJob - Complete job with review, update tech rating, confirm payment
const completeJob = async (req, res) => {
  try {
    const { jobId, review, paymentConfirmed } = req.body;
    const userId = req.user.id;

    const job = await Job.findById(jobId);
    if (!job || job.userId.toString() !== userId) return res.status(403).json({ msg: 'Unauthorized' });

    job.status = 'completed';
    job.review = review;
    job.paymentStatus = paymentConfirmed ? 'confirmed' : 'pending';
    await job.save();

    // Update tech rating (weighted average)
    const tech = await Technician.findById(job.techId);
    tech.updateRating(review.rating);

    // Emit completion
    req.io.to(job.techId).emit('jobCompleted', { jobId, review });

    // Log completion
    console.log(`Job ${jobId} completed with ${review.rating} stars`);

    // Log
    await Activity.logActivity('job_completed', userId, { jobId, review });

    res.json({ success: true, job });
  } catch (err) {
    console.error('Complete Job Error:', err);
    res.status(500).json({ msg: 'Failed to complete job', error: err.message });
  }
};

const completeJobValidation = [
  body('jobId').isMongoId(),
  body('review.rating').isInt({ min: 1, max: 5 }),
  body('paymentConfirmed').isBoolean(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// getJobs - Get jobs for user/tech/admin (filtered by status/role)
const getJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const role = req.user.role;

    let filter = {};
    if (role === 'user') {
      filter.userId = userId;
    } else if (role === 'tech') {
      const Technician = require('../models/Technician');
      const techDoc = await Technician.findOne({ userId }).select('_id');
      if (!techDoc) {
        return res.status(404).json({ msg: 'Technician profile not found for this account' });
      }
      filter.techId = techDoc._id;
    }

    // Admin sees all
    if (status) filter.status = status;

    const jobs = await Job.find(filter)
      .populate('userId', 'name')
      .populate('techId', 'name rating')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Job.countDocuments(filter);
    res.json({ success: true, jobs, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Get Jobs Error:', err);
    res.status(500).json({ msg: 'Failed to fetch jobs', error: err.message });
  }
};

module.exports = {
  createJob,
  createJobValidation,
  updateStatus,
  updateStatusValidation,
  completeJob,
  completeJobValidation,
  getJobs
};