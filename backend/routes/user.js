// routes/user.js - User routes for FixItNow
// Routes: GET /search-tech, POST /book-job, GET /track-job/:jobId, POST /loyalty, GET /weather-suggest
// Middleware: auth (user role), validate
const express = require('express');
const router = express.Router();
const { searchTechnicians, bookJob, trackJob, manageLoyalty, weatherSuggest } = require('../controllers/user');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// All routes require user auth
router.use(auth(['user']));

// GET /api/user/search-tech - Search technicians
router.get('/search-tech', validate.searchTechnicians, searchTechnicians);

// POST /api/user/book-job - Book a job
router.post('/book-job', validate.bookJob, bookJob);

// GET /api/user/track-job/:jobId - Track job status
router.get('/track-job/:jobId', trackJob);

// POST /api/user/loyalty - Manage loyalty points
router.post('/loyalty', validate.manageLoyalty, manageLoyalty);

// GET /api/user/weather-suggest - Weather-based suggestions
router.get('/weather-suggest', weatherSuggest);

module.exports = router;