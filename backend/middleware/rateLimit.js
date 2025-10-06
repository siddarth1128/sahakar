// middleware/rateLimit.js - Simple rate limiting for FixItNow
const rateLimit = require('express-rate-limit');

// OTP rate limit: 3 requests per hour per IP
const otpLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { msg: 'Too many OTP requests. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limit: 100 requests per 15 minutes per IP
const apiLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { msg: 'Too many requests. Slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  otpLimit,
  apiLimit
};