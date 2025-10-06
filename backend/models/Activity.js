// Activity.js - Model for real-time monitoring and admin logs in FixItNow
// Fields: action (e.g., 'job_booked', 'tech_approved'), userId (ref User), timestamp (Date)
// Indexes: Compound on userId + timestamp for user-specific activity feeds, action for filtering
// Compatibility: Real-time logs via Socket.io (emit on actions), Redis for caching recent activities
// Usage: Logged in controllers (e.g., booking creation), queried for admin dashboard analytics
const mongoose = require('mongoose');
const { Schema } = mongoose;

const activitySchema = new Schema({
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      // Auth/User
      'user_signed_up', 'user_auto_signed_up', 'user_logged_in',
      // OTP
      'otp_sent', 'otp_verified',
      // Technician/Admin
      'tech_register', 'tech_approved', 'tech_rejected', 'tech_removed',
      // Jobs
      'job_booked', 'job_created', 'job_status_updated', 'job_accepted', 'job_declined', 'job_started', 'job_completed',
      // Payments/Reviews/Disputes
      'payment_confirmed', 'review_submitted', 'dispute_opened', 'dispute_resolved',
      // Loyalty/Referral
      'referral_used', 'points_earned', 'points_redeemed',
      // Search/Analytics
      'search_tech',
      // Messaging/Tech Ops
      'message_sent', 'freeze_mode_set', 'premium_upgrade'
    ],
    maxlength: [50, 'Action name too long']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  details: {
    type: Schema.Types.Mixed, // Flexible: {jobId, techId, points, etc.}
    default: {}
  },
  ipAddress: {
    type: String, // For security/monitoring
    maxlength: [45, 'Invalid IP format'] // IPv6 support
  }
}, {
  timestamps: { 
    // Use millisecond precision (default) so Mongoose stores proper Date values
    currentTime: () => Date.now()
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
activitySchema.index({ userId: 1, createdAt: -1 }); // User's recent activities
activitySchema.index({ action: 1, createdAt: -1 }); // Filter by action (e.g., all bookings)
activitySchema.index({ createdAt: -1 }); // Recent logs for admin dashboard
activitySchema.index({ ipAddress: 1 }); // Security queries

// Virtual for user population

// Static method to log activity (call from controllers/middleware)
activitySchema.statics.logActivity = async function(action, userId, details = {}, ip = null) {
  const activity = new this({
    action,
    userId: userId || null,
    details,
    ipAddress: ip
  });
  await activity.save();
  // Emit real-time to admin (in controller: io.to('admin').emit('activityLog', activity))
  return activity;
};

// Aggregation pipeline for analytics (e.g., jobs per day)
activitySchema.statics.getAnalytics = function(timeRange = 'day') {
  const match = { action: { $in: ['job_booked', 'job_completed'] } };
  if (timeRange === 'day') {
    match.createdAt = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
  }
  // More ranges: week, month
  return this.aggregate([
    { $match: match },
    { $group: { _id: '$action', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Activity', activitySchema);