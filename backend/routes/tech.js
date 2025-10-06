const express = require('express');
const router = express.Router();
const { register, acceptJob, declineJob, setFreezeMode, initiateVideoCall, premiumUpgrade, getNearbyTechnicians, setActiveStatus } = require('../controllers/tech');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// Public: Nearby technicians for customers
// GET /api/tech/nearby?lat=&lng=&radius=&service=&minRating=&q=
router.get('/nearby', getNearbyTechnicians);

// Tech-only routes below
router.use(auth(['tech']));

// POST /api/tech/register - Register technician
router.post('/register', validate.registerTech, register);

// POST /api/tech/accept-job/:jobId - Accept job
router.post('/accept-job/:jobId', validate.acceptJob, acceptJob);

// POST /api/tech/decline-job/:jobId - Decline job
router.post('/decline-job/:jobId', validate.acceptJob, declineJob);

// POST /api/tech/freeze-mode - Set freeze mode
router.post('/freeze-mode', setFreezeMode);

// POST /api/tech/video-call/:jobId - Initiate video call
router.post('/video-call/:jobId', validate.acceptJob, initiateVideoCall);

// POST /api/tech/premium - Upgrade to premium
router.post('/premium', premiumUpgrade);

// POST /api/tech/active - Toggle active/inactive
router.post('/active', setActiveStatus);

module.exports = router;