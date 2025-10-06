const express = require('express');
const router = express.Router();
const { referralCode } = require('../controllers/auth');
const rateLimit = require('../middleware/rateLimit');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const passport = require('passport');
const jwt = require('jsonwebtoken');

// Helper to choose frontend origin
const parseOrigins = (str) => (str || '').split(',').map(s => s.trim()).filter(Boolean);
const allowedOrigins = parseOrigins(process.env.CLIENT_URLS);
const fallbackOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
const frontendOrigin = allowedOrigins.length ? allowedOrigins[0] : fallbackOrigin;

// OTP routes removed: send-otp, verify-otp (frontend no longer uses OTP flows)

// POST /api/auth/referral-code - Handle referral code (authenticated)
router.post('/referral-code', auth, referralCode);

// POST /api/auth/signup - Password signup with validation
const { body } = require('express-validator');
router.post('/signup', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  body('name').notEmpty().trim().withMessage('Name required'),
  body('role').optional().isIn(['user', 'tech', 'admin']).withMessage('Invalid role')
], require('../controllers/auth').signup);

// POST /api/auth/login - Password login with validation
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  body('role').optional().isIn(['user', 'tech', 'admin']).withMessage('Invalid role')
], require('../controllers/auth').login);

// POST /api/auth/request-password-reset
router.post('/request-password-reset', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required')
], require('../controllers/auth').requestPasswordReset);

// POST /api/auth/reset-password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars')
], require('../controllers/auth').resetPassword);

router.get('/google', (req, res, next) => {
  const role = req.query.role || 'user';
  req.session.tempRole = role;
  passport.authenticate('google', { scope: ['profile', 'email'], state: role })(req, res, next);
});

router.get('/google/callback', passport.authenticate('google', { failureRedirect: `${frontendOrigin}/login` }), (req, res) => {
  if (req.user) {
    const token = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    const userPayload = { id: req.user._id, name: req.user.name, role: req.user.role };
    const redirectUrl = `${frontendOrigin}/auth/callback?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(userPayload))}`;
    res.redirect(redirectUrl);
  } else {
    res.redirect(`${frontendOrigin}/login`);
  }
});

module.exports = router;