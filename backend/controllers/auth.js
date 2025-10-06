// controllers/auth.js - Authentication controllers for FixItNow MERN app
// Features: sendOtp (generate/store/send via AWS SNS/Nodemailer+Redis queue), verifyOtp (check/ issue JWT with role), referralCode (generate/use for loyalty points)
// Security: Rate-limit OTP requests (3/hour/user via Redis), input validation (express-validator), 5-min expiry in Otp model
// Connections: Uses models/User, models/Otp; utils/emailWorker for email queue; middleware/rateLimit for Redis rate limiting; Socket.io for 'otpSent' feedback
// Free-tier: AWS SNS (100 SMS/month), Nodemailer with Gmail (~100 emails/day)
// Error handling: Try-catch for AWS/Nodemailer errors, validation errors returned as JSON
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// Simplified without AWS and Redis for basic functionality
const { validationResult } = require('express-validator');
const Activity = require('../models/Activity');
const PasswordReset = require('../models/PasswordReset');

// OTP-based flows removed in this build. Frontend no longer calls send-otp/verify-otp.

// referralCode - Generate unique referral code, handle usage/points earning
// On signup/login, check if code used, award points to referrer
exports.referralCode = [
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
      const { userId, referredByCode } = req.body;
      const user = await User.findById(userId);

      if (referredByCode) {
        // Validate code and award points to referrer (no 'used' flag in schema, so just credit once)
        const referrer = await User.findOne({ 'referrals.code': referredByCode });
        if (!referrer) {
          return res.status(400).json({ msg: 'Invalid referral code' });
        }
        referrer.loyaltyPoints += 50;
        await referrer.save();
        await Activity.logActivity('referral_used', referrer._id, { referredUser: userId, points: 50 });
        return res.json({ success: true, pointsAwarded: 50, referrer: { id: referrer._id, name: referrer.name } });
      } else {
        // Generate new unique code for user
        let code;
        do {
          code = crypto.randomBytes(8).toString('hex').toUpperCase(); // 16-char code
        } while (await User.findOne({ 'referrals.code': code })); // Ensure unique

        user.referrals.push({ code });
        await user.save();
        return res.json({ success: true, referralCode: code });
      }
    } catch (err) {
      console.error('Referral Error:', err);
      res.status(500).json({ msg: 'Failed to handle referral', error: err.message });
    }
  }
];

// Request password reset via email (dev: returns token if no email provider configured)
exports.requestPasswordReset = [
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ msg: 'No account found for this email' });
      }

      // Invalidate previous tokens
      await PasswordReset.deleteMany({ userId: user._id });

      // Generate a unique token with minimal retries for collision
      let token, created = false, attempts = 0;
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      while (!created && attempts < 3) {
        attempts++;
        token = crypto.randomBytes(24).toString('hex');
        try {
          await PasswordReset.create({ userId: user._id, token, expiresAt });
          created = true;
        } catch (e) {
          if (e && e.code === 11000) {
            // Duplicate token, retry
            continue;
          }
          throw e;
        }
      }
      if (!created) {
        return res.status(500).json({ success: false, msg: 'Failed to generate reset token' });
      }

      // TODO: send email here. For dev/demo, return token in response.
      await Activity.logActivity('password_reset_requested', user._id, { email });
      return res.json({ success: true, msg: 'Password reset link generated', token });
    } catch (err) {
      console.error('Request Password Reset Error:', err);
      return res.status(500).json({ success: false, msg: 'Failed to request password reset', error: err.message });
    }
  }
];

// Reset password with token
exports.resetPassword = [
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res) => {
    try {
      const { token, password } = req.body;
      const pr = await PasswordReset.findOne({ token });
      if (!pr || pr.expiresAt < new Date()) {
        return res.status(400).json({ msg: 'Invalid or expired reset token' });
      }
      const user = await User.findById(pr.userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      user.password = password; // will be hashed by pre-save hook
      await user.save();

      await PasswordReset.deleteOne({ _id: pr._id });
      await Activity.logActivity('password_reset_completed', user._id, {});
      return res.json({ success: true, msg: 'Password has been reset successfully' });
    } catch (err) {
      console.error('Reset Password Error:', err);
      return res.status(500).json({ msg: 'Failed to reset password', error: err.message });
    }
  }
];

// Password-based signup
exports.signup = [
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res) => {
    try {
      const { email, password, name, role = 'user' } = req.body;
      const existingUser = await User.findOne({ $or: [{ email }, { phone: email }] });
      if (existingUser) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      const user = new User({ email, password, name, role });
      await user.save(); // Hashes password via pre-save in model

      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

      await Activity.logActivity('user_signed_up', user._id, { role });

      res.status(201).json({
        success: true,
        token,
        user: { id: user._id, name: user.name, role: user.role }
      });
    } catch (err) {
      console.error('Signup Error:', err);
      res.status(500).json({ msg: 'Signup failed', error: err.message });
    }
  }
];

// Password-based login
exports.login = [
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res) => {
    try {
      const { email, password, role } = req.body;
      let user = await User.findOne({ email });
      if (!user) {
        // Auto-create user on first login if no existing user with this email
        const name = email.split('@')[0].replace(/\./g, ' ').replace(/-/g, ' ');
        const effectiveRole = ['user', 'tech', 'admin'].includes(role) ? role : 'user';
        user = new User({ email, password, name, role: effectiveRole });
        await user.save();
        await Activity.logActivity('user_auto_signed_up', user._id, { role });
      } else {
        // Existing user: only enforce role if caller explicitly provided a conflicting role
        if (role && user.role !== role) {
          return res.status(400).json({ msg: 'User exists with different role. Please use correct role or contact support.' });
        }
      }
      if (!user.password) {
        return res.status(401).json({ msg: 'Account created via social login. Please use Google to sign in.' });
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ msg: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

      await Activity.logActivity('user_logged_in', user._id, { role: user.role });

      res.json({
        success: true,
        token,
        user: { id: user._id, name: user.name, role: user.role }
      });
    } catch (err) {
      console.error('Login Error:', err);
      res.status(500).json({ msg: 'Login failed', error: err.message });
    }
  }
];
