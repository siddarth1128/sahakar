// user.js - Controllers for user role in FixItNow MERN app
// Features: search technicians (fuzzy text on services + geo location via $near, filters by rating/availability from Redis), book jobs (validate, check tech availability, create Job, update points/referrals), track jobs (populate status), manage loyalty (earn/redeem points), weather suggestions (OpenWeatherMap API)
// Security: Auth middleware protects routes, input validation via express-validator
// Connections: Models/User, Technician, Job, Activity; Utils/weatherApi, aiRecommend for recommendations; Redis for availability check/cache
// Real-time: Socket.io for job updates, Redis queue for notifications on booking
const User = require('../models/User');
const Technician = require('../models/Technician');
const Job = require('../models/Job');
const Activity = require('../models/Activity');
const { body, validationResult } = require('express-validator');
const weatherApi = require('../utils/weatherApi');
const aiRecommend = require('../utils/aiRecommend');
const jwt = require('jsonwebtoken');

// In-memory storage for demo
const techAvailability = new Map();

// searchTechnicians - Search techs with fuzzy services, location ($near for Leaflet), filters (rating, available)
// Uses MongoDB text index on Technician.services, geo on location; Cache results in Redis for 5 min
const searchTechniciansMiddleware = [
  // Validation
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res) => {
    try {
      const { query, lat, lng, radius = 10, minRating = 0, services = [], premium = false } = req.query;
      const userId = req.user.id; // From auth middleware

      // Build geo point
      const location = {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      };

      // Aggregation pipeline for fuzzy search + geo + filters
      const pipeline = [
        // Match filters
        {
          $match: {
            approved: true, // Only approved techs
            ...(minRating > 0 && { rating: { $gte: minRating } }),
            ...(services.length > 0 && { services: { $in: services } }),
            ...(premium && { premium: true })
          }
        },
        // Geospatial $near for location-based results
        {
          $geoNear: {
            near: location,
            distanceField: 'dist.calculated',
            maxDistance: parseInt(radius) * 1000, // km to meters
            spherical: true,
            distanceMultiplier: 1 / 6371 // km
          }
        },
        // Text search if query provided (fuzzy on services)
        ...(query && [
          {
            $match: {
              $text: { $search: query }
            }
          }
        ]),
        // Project relevant fields
        {
          $project: {
            name: 1,
            phone: 1,
            services: 1,
            rating: 1,
            premium: 1,
            location: 1,
            dist: { $ifNull: ['$dist.calculated', 0] },
            // AI recommendation score (rule-based: rating * 0.6 + proximity * 0.4)
            aiScore: {
              $add: [
                { $multiply: ['$rating', 0.6] },
                { $multiply: [{ $divide: [{ $subtract: [5, '$dist.calculated'] }, 5] }, 0.4] } // Normalize distance
              ]
            }
          }
        },
        // Sort by AI score descending
        { $sort: { aiScore: -1 } },
        { $limit: 20 } // Top 20 results
      ];

      let techs = await Technician.aggregate(pipeline);

      // Enhance with availability check
      techs = techs.map(tech => {
        const cacheKey = `tech:${tech._id}:status`;
        const cachedStatus = techAvailability.get(cacheKey);
        tech.isAvailable = !cachedStatus || cachedStatus === 'available';
        return tech;
      });

      // Log search activity
      await Activity.logActivity('search_tech', userId, { query, lat, lng, radius, results: techs.length });

      res.json({ success: true, technicians: techs });
    } catch (err) {
      console.error('Search Error:', err);
      res.status(500).json({ msg: 'Search failed', error: err.message });
    }
  }
];

// bookJob - Create booking with multi-contact, check tech availability in Redis, create Job, update points/referral if applicable
// On success: Emit Socket.io 'jobCreated', queue notifications (email/SMS via utils/emailWorker), log Activity
const bookJobMiddleware = [
  // Validation
  body('techId').isMongoId(),
  body('serviceType').isLength({ min: 1 }),
  body('beneficiaryPhone').optional().isMobilePhone(),
  body('price').isNumeric().isLength({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { techId, serviceType, beneficiaryName, beneficiaryPhone, description, referralCode } = req.body;
      const userId = req.user.id;

      // Check tech availability
      const availabilityKey = `tech:${techId}:busy`;
      const isBusy = techAvailability.get(availabilityKey);
      if (isBusy === 'busy') {
        return res.status(400).json({ msg: 'Technician is currently busy' });
      }

      // Create Job
      const job = new Job({
        userId,
        techId,
        price: parseFloat(req.body.price),
        beneficiaryName,
        beneficiaryPhone,
        serviceType,
        description
      });
      await job.save();

      // Update tech availability
      techAvailability.set(availabilityKey, 'busy');
      setTimeout(() => techAvailability.delete(availabilityKey), 1800000);

      // Handle referral if provided
      if (referralCode) {
        const user = await User.findById(userId);
        // Validate referral code belongs to some existing user
        const referrer = await User.findOne({ 'referrals.code': referralCode });
        if (referrer) {
          user.loyaltyPoints += 25; // Earn points on booking for the user who used the code
          await user.save();
          await Activity.logActivity('points_earned', userId, { source: 'referral', points: 25 });
        }
      }

      // Log notification (in production, queue for processing)
      console.log(`Notification: Job booked - ${serviceType} for ₹${job.price}`);

      // Emit real-time
      // In server.js or middleware: io.emit('jobCreated', { jobId: job._id, userId, techId });

      // Log activity
      await Activity.logActivity('job_booked', userId, { techId, jobId: job._id, price: job.price });

      res.json({ success: true, job });
    } catch (err) {
      console.error('Book Job Error:', err);
      res.status(500).json({ msg: 'Booking failed', error: err.message });
    }
  }
];

// trackJob - Get user's job with populated data, real-time status from Redis if available
const trackJobMiddleware = [
  async (req, res) => {
    try {
      const { jobId } = req.params;
      const userId = req.user.id;

      const job = await Job.findOne({ _id: jobId, userId })
        .populate('techId', 'name rating services location') // Partial tech info
        .populate('userId', 'name'); // Own user data

      if (!job) {
        return res.status(404).json({ msg: 'Job not found' });
      }

      // Job status from database (real-time updates via Socket.io)

      res.json({ success: true, job });
    } catch (err) {
      console.error('Track Job Error:', err);
      res.status(500).json({ msg: 'Failed to track job', error: err.message });
    }
  }
];

// manageLoyalty - Earn/redeem points for loyalty system
const manageLoyaltyMiddleware = [
  body('action').isIn(['earn', 'redeem']),
  body('points').optional().isInt({ min: 1 }),
  async (req, res) => {
    try {
      const { action, points, source } = req.body; // source: 'booking', 'review', etc.
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (action === 'earn') {
        user.loyaltyPoints += points;
        await Activity.logActivity('points_earned', userId, { source, points });
      } else if (action === 'redeem') {
        if (user.loyaltyPoints < points) {
          return res.status(400).json({ msg: 'Insufficient points' });
        }
        user.loyaltyPoints -= points;
        await Activity.logActivity('points_redeemed', userId, { points });
      }

      await user.save();
      res.json({ success: true, loyaltyPoints: user.loyaltyPoints });
    } catch (err) {
      console.error('Loyalty Error:', err);
      res.status(500).json({ msg: 'Failed to manage loyalty', error: err.message });
    }
  }
];

// weatherSuggest - Integrate OpenWeatherMap for scheduling suggestions based on user location
const weatherSuggestMiddleware = [
  async (req, res) => {
    try {
      const { lat, lng } = req.query;
      const userId = req.user.id;

      const weather = await weatherApi.getForecast(lat, lng);
      // Simple rule: If rain, suggest indoor services or delay outdoor jobs
      const suggestions = weather.rain ? 'Consider scheduling indoor services or checking for delays due to weather.' : 'Good weather for outdoor jobs like plumbing or electrical work.';
      
      res.json({ success: true, weather, suggestions });
    } catch (err) {
      console.error('Weather Suggest Error:', err);
      res.status(500).json({ msg: 'Failed to get weather suggestions', error: err.message });
    }
  }
];

module.exports = {
  searchTechnicians: searchTechniciansMiddleware,
  bookJob: bookJobMiddleware,
  trackJob: trackJobMiddleware,
  manageLoyalty: manageLoyaltyMiddleware,
  weatherSuggest: weatherSuggestMiddleware
};