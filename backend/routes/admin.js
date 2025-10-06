const express = require('express');
const router = express.Router();
const { getActivities, approveTechnician, removeTechnician, getAnalytics, manageCategories, resolveDispute, manageLoyalty } = require('../controllers/admin');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// All routes require admin auth
router.use(auth(['admin']));

// GET /api/admin/activities - Get activity logs
router.get('/activities', getActivities);

// POST /api/admin/approve-tech - Approve technician
router.post('/approve-tech', validate.approveTechnician, approveTechnician);

// POST /api/admin/remove-tech - Remove technician
router.post('/remove-tech', validate.removeTechnician, removeTechnician);

// GET /api/admin/analytics - Get analytics
router.get('/analytics', getAnalytics);

// POST /api/admin/categories - Manage categories
router.post('/categories', manageCategories);

// POST /api/admin/resolve-dispute - Resolve dispute
router.post('/resolve-dispute', validate.resolveDispute, resolveDispute);

// POST /api/admin/loyalty - Manage loyalty points
router.post('/loyalty', validate.manageLoyaltyAdmin, manageLoyalty);

module.exports = router;