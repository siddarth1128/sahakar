// middleware/validate.js - Input validation middleware for FixItNow
// Uses express-validator for sanitization and validation
// Connections: express-validator, applied in routes before controllers
const { body } = require('express-validator');

// Validation rules for auth
const sendOtp = [
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('type').optional().isIn(['signup', 'login', 'forgot']).withMessage('Invalid type')
];

const verifyOtp = [
  body('userId').optional().isMongoId().withMessage('Invalid user ID'),
  body('otpCode').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits'),
  body('role').optional().isIn(['user', 'admin', 'tech']).withMessage('Invalid role')
];

const referralCode = [
  body('userId').isMongoId().withMessage('Invalid user ID'),
  body('referredByCode').optional().isLength({ min: 16, max: 16 }).withMessage('Invalid referral code')
];

// Validation for user
const searchTechnicians = [
  body('query').optional().isLength({ min: 1 }).withMessage('Query too short'),
  body('lat').optional().isFloat().withMessage('Invalid latitude'),
  body('lng').optional().isFloat().withMessage('Invalid longitude'),
  body('radius').optional().isInt({ min: 1 }).withMessage('Invalid radius')
];

const bookJob = [
  body('techId').isMongoId().withMessage('Invalid technician ID'),
  body('serviceType').isLength({ min: 1 }).withMessage('Service type required'),
  body('beneficiaryPhone').optional().isMobilePhone().withMessage('Invalid beneficiary phone'),
  body('price').isFloat({ min: 0 }).withMessage('Invalid price')
];

const manageLoyalty = [
  body('action').isIn(['earn', 'redeem']).withMessage('Invalid action'),
  body('points').isInt({ min: 1 }).withMessage('Invalid points')
];

// Validation for tech
const registerTech = [
  body('services').isArray({ min: 1 }).withMessage('At least one service required'),
  body('lat').isFloat().withMessage('Invalid latitude'),
  body('lng').isFloat().withMessage('Invalid longitude')
];

const acceptJob = [
  body('jobId').isMongoId().withMessage('Invalid job ID')
];

// Validation for admin
const approveTechnician = [
  body('techId').isMongoId().withMessage('Invalid technician ID'),
  body('approved').isBoolean().withMessage('Approved must be boolean')
];

const removeTechnician = [
  body('techId').isMongoId().withMessage('Invalid technician ID'),
  body('reason').isLength({ min: 1 }).withMessage('Reason required')
];

const resolveDispute = [
  body('disputeId').isMongoId().withMessage('Invalid dispute ID'),
  body('resolution').isLength({ min: 1 }).withMessage('Resolution required')
];

const manageLoyaltyAdmin = [
  body('userId').isMongoId().withMessage('Invalid user ID'),
  body('points').isInt({ min: 0 }).withMessage('Invalid points')
];

// Validation for job
const createJob = [
  body('userId').isMongoId().withMessage('Invalid user ID'),
  body('techId').isMongoId().withMessage('Invalid technician ID'),
  body('price').isFloat({ min: 0 }).withMessage('Invalid price')
];

const updateStatus = [
  body('jobId').isMongoId().withMessage('Invalid job ID'),
  body('status').isIn(['pending', 'in-progress', 'completed', 'cancelled']).withMessage('Invalid status')
];

const completeJob = [
  body('jobId').isMongoId().withMessage('Invalid job ID'),
  body('review.rating').isInt({ min: 1, max: 5 }).withMessage('Invalid rating'),
  body('paymentConfirmed').isBoolean().withMessage('Payment confirmation required')
];

module.exports = {
  sendOtp,
  verifyOtp,
  referralCode,
  searchTechnicians,
  bookJob,
  manageLoyalty,
  registerTech,
  acceptJob,
  approveTechnician,
  removeTechnician,
  resolveDispute,
  manageLoyaltyAdmin,
  createJob,
  updateStatus,
  completeJob
};