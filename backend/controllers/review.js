// controllers/review.js - Review controllers for FixItNow
// Features: submitReview (post-job, update tech rating), getReviews (for tech profile), getAverageRating
// Security: Auth, validate only user can review their job
// Connections: Models/Review, Job, Technician, Activity
const Review = require('../models/Review');
const Job = require('../models/Job');
const Technician = require('../models/Technician');
const Activity = require('../models/Activity');
const { body, validationResult } = require('express-validator');

// submitReview - Submit review for completed job
const submitReview = [
  body('jobId').isMongoId(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().isLength({ max: 500 }),
  body('images').optional().isArray({ max: 5 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const { jobId, rating, comment, images = [] } = req.body;

      const job = await Job.findOne({ _id: jobId, userId });
      if (!job || job.status !== 'completed') {
        return res.status(400).json({ msg: 'Invalid job for review' });
      }

      // Check if review already submitted
      const existingReview = await Review.findOne({ jobId });
      if (existingReview) {
        return res.status(400).json({ msg: 'Review already submitted' });
      }

      const review = new Review({
        jobId,
        reviewerId: userId,
        techId: job.techId,
        rating,
        comment,
        images
      });
      await review.save();

      // Update tech rating
      const tech = await Technician.findById(job.techId);
      tech.rating = await Review.getAverageRating(job.techId).then(result => result[0]?.averageRating || 0);
      await tech.save();

      // Log
      await Activity.logActivity('review_submitted', userId, { jobId, rating });

      res.json({ success: true, review });
    } catch (err) {
      console.error('Submit Review Error:', err);
      res.status(500).json({ msg: 'Failed to submit review', error: err.message });
    }
  }
];

// getReviews - Get reviews for a tech
const getReviews = [
  body('techId').isMongoId(),
  body('page').optional().isInt({ min: 1 }),
  body('limit').optional().isInt({ min: 1, max: 50 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { techId, page = 1, limit = 10 } = req.query;

      const reviews = await Review.find({ techId })
        .populate('reviewerId', 'name')
        .populate('jobId', 'price status')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit);

      const total = await Review.countDocuments({ techId });

      res.json({ success: true, reviews, total, pages: Math.ceil(total / limit) });
    } catch (err) {
      console.error('Get Reviews Error:', err);
      res.status(500).json({ msg: 'Failed to get reviews', error: err.message });
    }
  }
];

// getAverageRating - Get average rating for tech
const getAverageRating = [
  body('techId').isMongoId(),
  async (req, res) => {
    try {
      const { techId } = req.params;
      const result = await Review.getAverageRating(techId);
      res.json({ success: true, averageRating: result[0]?.averageRating || 0, reviewCount: result[0]?.reviewCount || 0 });
    } catch (err) {
      console.error('Get Average Rating Error:', err);
      res.status(500).json({ msg: 'Failed to get average rating', error: err.message });
    }
  }
];

module.exports = { submitReview, getReviews, getAverageRating };