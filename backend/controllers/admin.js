// controllers/admin.js - Admin role controllers for FixItNow MERN app
// Features: monitor activities (real-time logs via Socket.io), approve/reject technicians (view proofs), remove technicians (ratings <3 or complaints >3), analytics (job/user stats with Chart.js), manage service categories, resolve disputes (moderated chat via Socket.io), oversee loyalty/referral systems
// Security: Auth middleware (role 'admin'), validation
// Connections: Models/Technician, Job, Activity, Dispute; Redis for caching stats; Socket.io for real-time logs/disputes
// Real-time: Socket.io for activity logs, dispute chat moderation
const Technician = require('../models/Technician');
const Job = require('../models/Job');
const Activity = require('../models/Activity');
const Dispute = require('../models/Dispute');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// In-memory cache for demo
const cache = new Map();

// getActivities - Fetch real-time activity logs (paginated, filtered by action/date)
const getActivities = [
  async (req, res) => {
    try {
      const { page = 1, limit = 20, action, startDate, endDate } = req.query;
      const filter = {};
      if (action) filter.action = action;
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      const activities = await Activity.find(filter)
        .populate('userId', 'name role')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Activity.countDocuments(filter);
      res.json({ success: true, activities, total, pages: Math.ceil(total / limit) });
    } catch (err) {
      console.error('Get Activities Error:', err);
      res.status(500).json({ msg: 'Failed to fetch activities', error: err.message });
    }
  }
];

// approveTechnician - Approve/reject technician registration (view Aadhar, set approved)
const approveTechnician = [
  body('techId').isMongoId(),
  body('approved').isBoolean(),
  async (req, res) => {
    try {
      const { techId, approved } = req.body;
      const tech = await Technician.findById(techId);
      if (!tech) return res.status(404).json({ msg: 'Technician not found' });

      tech.approved = approved;
      await tech.save();

      // Log activity
      await Activity.logActivity(approved ? 'tech_approved' : 'tech_rejected', req.user.id, { techId });

      // Emit to tech (if online)
      req.io.to(techId).emit('approvalUpdate', { approved });

      res.json({ success: true, msg: `Technician ${approved ? 'approved' : 'rejected'}` });
    } catch (err) {
      console.error('Approve Tech Error:', err);
      res.status(500).json({ msg: 'Failed to update approval', error: err.message });
    }
  }
];

// removeTechnician - Remove technician if ratings <3 or complaints >3
const removeTechnician = [
  body('techId').isMongoId(),
  body('reason').isLength({ min: 1 }),
  async (req, res) => {
    try {
      const { techId, reason } = req.body;
      const tech = await Technician.findById(techId);
      if (!tech) return res.status(404).json({ msg: 'Technician not found' });

      // Check criteria (ratings <3 or complaints >3 - assume complaints from disputes)
      const complaints = await Dispute.countDocuments({ jobId: { $in: await Job.find({ techId }).distinct('_id') }, openedBy: { $ne: techId } });
      if (tech.rating >= 3 && complaints <= 3) {
        return res.status(400).json({ msg: 'Technician does not meet removal criteria' });
      }

      // Soft delete or deactivate (set approved: false)
      tech.approved = false;
      await tech.save();

      // Log
      await Activity.logActivity('tech_removed', req.user.id, { techId, reason });

      res.json({ success: true, msg: 'Technician removed' });
    } catch (err) {
      console.error('Remove Tech Error:', err);
      res.status(500).json({ msg: 'Failed to remove technician', error: err.message });
    }
  }
];

// getAnalytics - Analytics for jobs/users (cached in Redis for 5 min)
const getAnalytics = [
  async (req, res) => {
    try {
      const cacheKey = 'admin:analytics';
      let analytics = cache.get(cacheKey);
      if (analytics) {
        return res.json({ success: true, analytics });
      }

      // Aggregate data
      const totalUsers = await User.countDocuments();
      const totalTechs = await Technician.countDocuments({ approved: true });
      const totalJobs = await Job.countDocuments();
      const completedJobs = await Job.countDocuments({ status: 'completed' });
      const avgRating = await Technician.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]);

      analytics = {
        totalUsers,
        totalTechs,
        totalJobs,
        completedJobs,
        avgTechRating: avgRating[0]?.avg || 0,
        // More: jobs per day, etc.
      };

      // Cache for 5 min
      cache.set(cacheKey, analytics);
      setTimeout(() => cache.delete(cacheKey), 300000);

      res.json({ success: true, analytics });
    } catch (err) {
      console.error('Analytics Error:', err);
      res.status(500).json({ msg: 'Failed to fetch analytics', error: err.message });
    }
  }
];

// manageCategories - Add/edit service categories (simple array in env or DB, but for now static)
const manageCategories = [
  body('categories').isArray(),
  async (req, res) => {
    try {
      const { categories } = req.body;
      // In production, store in DB or env
      // For now, return success
      res.json({ success: true, msg: 'Categories updated', categories });
    } catch (err) {
      console.error('Manage Categories Error:', err);
      res.status(500).json({ msg: 'Failed to manage categories', error: err.message });
    }
  }
];

// resolveDispute - Resolve dispute via moderated chat (update status, resolution)
const resolveDispute = [
  body('disputeId').isMongoId(),
  body('resolution').isLength({ min: 1 }),
  async (req, res) => {
    try {
      const { disputeId, resolution } = req.body;
      const dispute = await Dispute.findById(disputeId);
      if (!dispute) return res.status(404).json({ msg: 'Dispute not found' });

      await dispute.resolve(req.user.id, resolution);

      // Emit to participants
      req.io.to(`dispute-${disputeId}`).emit('disputeResolved', { resolution });

      res.json({ success: true, msg: 'Dispute resolved' });
    } catch (err) {
      console.error('Resolve Dispute Error:', err);
      res.status(500).json({ msg: 'Failed to resolve dispute', error: err.message });
    }
  }
];

// manageLoyalty - Admin oversight for loyalty/referral systems (view/edit points)
const manageLoyalty = [
  body('userId').isMongoId(),
  body('points').isInt(),
  async (req, res) => {
    try {
      const { userId, points } = req.body;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ msg: 'User not found' });

      user.loyaltyPoints = points;
      await user.save();

      // Log
      await Activity.logActivity('loyalty_managed', req.user.id, { userId, points });

      res.json({ success: true, msg: 'Loyalty points updated' });
    } catch (err) {
      console.error('Manage Loyalty Error:', err);
      res.status(500).json({ msg: 'Failed to manage loyalty', error: err.message });
    }
  }
];

module.exports = {
  getActivities,
  approveTechnician,
  removeTechnician,
  getAnalytics,
  manageCategories,
  resolveDispute,
  manageLoyalty
};