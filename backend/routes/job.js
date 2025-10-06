const express = require('express');
const router = express.Router();
const { createJob, updateStatus, completeJob, getJobs } = require('../controllers/job');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// All routes require authentication
router.use(auth());

// POST /api/job/create - Create job
router.post('/create', validate.createJob, createJob);

// PUT /api/job/status - Update job status
router.put('/status', validate.updateStatus, updateStatus);

// POST /api/job/complete - Complete job
router.post('/complete', validate.completeJob, completeJob);

// GET /api/job/list - Get jobs
router.get('/list', getJobs);

module.exports = router;