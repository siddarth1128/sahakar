// middleware/auth.js - JWT authentication middleware for FixItNow
// Verifies JWT token, attaches user to req.user, checks role if specified
// Connections: Uses jsonwebtoken, User model for population
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ msg: 'Token is not valid' });
      }

      req.user = { id: user._id, role: user.role, name: user.name };
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ msg: 'Access denied' });
      }

      next();
    } catch (err) {
      res.status(401).json({ msg: 'Token is not valid' });
    }
  };
};

module.exports = auth;