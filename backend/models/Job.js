// Job.js - Model for bookings in FixItNow MERN app
// Fields: userId (ref User), techId (ref Technician), status (enum), price, paymentStatus (enum), review (post-completion), videoCallId (for WebRTC consultations)
// Indexes: Compound for user/tech status queries (track progress), price for sorting
// Compatibility: Status updates trigger Socket.io events (real-time tracking), Redis queue for notifications on changes
// Reviews contribute to weighted average in Technician model
const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  }
}, { _id: false }); // Embedded schema, no separate _id

const jobSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  techId: {
    type: Schema.Types.ObjectId,
    ref: 'Technician',
    required: [true, 'Technician ID is required']
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'confirmed'],
    default: 'pending'
  },
  review: {
    type: reviewSchema,
    default: null
  },
  videoCallId: {
    type: String, // Unique ID for WebRTC session
    default: null
  },
  // Additional: beneficiary details from User, but populate on query
  beneficiaryName: String, // From booking form (multi-contact)
  beneficiaryPhone: String,
  serviceType: String, // From Technician.services
  description: String // Job details
}, {
  timestamps: true, // createdAt for booking time, updatedAt for status changes
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
jobSchema.index({ userId: 1, status: 1 }); // User's active/pending jobs
jobSchema.index({ techId: 1, status: 1 }); // Tech's job queue
jobSchema.index({ status: 1, createdAt: -1 }); // Recent jobs by status
jobSchema.index({ price: 1 }); // For sorting/filtering
jobSchema.index({ paymentStatus: 1 });

// Virtuals for populating user/tech
jobSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

jobSchema.virtual('technician', {
  ref: 'Technician',
  localField: 'techId',
  foreignField: '_id',
  justOne: true
});

// Pre-save: Validate status transitions (e.g., can't go from completed to pending)
jobSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.review) {
    return next(new Error('Review is required for completed jobs'));
  }
  // Trigger notification queue (via utils/emailWorker.js in controller)
  next();
});

// Method to update status and notify via Socket.io/Redis (call from controller)
jobSchema.methods.updateStatus = async function(newStatus, io = null) {
  this.status = newStatus;
  await this.save();
  // Emit real-time update (in controller: io.emit('jobUpdate', { jobId: this._id, status: newStatus }))
  if (io) {
    io.to(this.userId).emit('jobStatusUpdate', { jobId: this._id, status: newStatus });
    io.to(this.techId).emit('jobStatusUpdate', { jobId: this._id, status: newStatus });
  }
  return this;
};

module.exports = mongoose.model('Job', jobSchema);