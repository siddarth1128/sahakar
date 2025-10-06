// User.js - Base model for all roles (user/admin/tech) in FixItNow MERN app
// Structure: phone, email, name, role, beneficiary, loyaltyPoints, referrals
// Compatibility: Designed for Redis caching (e.g., availability for techs) and JWT auth
// Indexes: Unique on phone/email for quick lookups
const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  phone: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple nulls for unique index
    match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple nulls for unique index
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: false,
    minlength: [6, 'Password must be at least 6 characters']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'tech'],
    default: 'user',
    required: true
  },
  beneficiary: {
    name: {
      type: String,
      maxlength: [100, 'Beneficiary name cannot exceed 100 characters']
    },
    phone: {
      type: String,
      match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid beneficiary phone']
    }
  },
  loyaltyPoints: {
    type: Number,
    default: 0,
    min: [0, 'Loyalty points cannot be negative']
  },
  referrals: [{
    code: {
      type: String,
      unique: true,
      sparse: true,
      required: true
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    pointsEarned: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Custom validation for requiring either phone or email
userSchema.pre('save', function(next) {
  if (!this.phone && !this.email) {
    next(new Error('Either phone or email is required'));
  }
  next();
});

// Virtual for full profile (can be populated in queries)
userSchema.virtual('fullProfile', {
  ref: 'Technician', // For tech roles
  localField: '_id',
  foreignField: 'userId',
  justOne: true
});

// Pre-save middleware for hashing if password added later (not in spec, but extensible)
userSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);