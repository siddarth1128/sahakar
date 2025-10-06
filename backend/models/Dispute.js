// Dispute.js - Model for dispute resolution in FixItNow MERN app
// Fields: jobId (ref Job), messages (array for real-time chat history, moderated by admin), status (open/resolved)
// Indexes: On jobId for quick lookup, status for admin queue
// Compatibility: Real-time moderated chat via Socket.io (admin joins room), triggered on complaints >3 or low ratings
// Usage: User/tech opens dispute on Job, admin resolves via messages; integrates with Activity model for logging
const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User', // User or admin
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: false }); // No additional timestamps for messages

const disputeSchema = new Schema({
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job ID is required'],
    unique: true // One dispute per job
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved'],
    default: 'open',
    required: true
  },
  messages: [messageSchema], // Real-time chat: user/tech/admin messages
  openedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Who initiated (user or tech)
    required: [true, 'Opened by user ID is required']
  },
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Admin who resolves
    default: null
  },
  resolution: {
    type: String, // e.g., 'refunded', 'job_cancelled', 'accepted'
    default: null
  }
}, {
  timestamps: true, // createdAt for dispute open time
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
disputeSchema.index({ status: 1, createdAt: -1 }); // Admin queue: open disputes first
disputeSchema.index({ 'messages.sender': 1 }); // For user-specific dispute chats

// Virtuals for populating job/user
disputeSchema.virtual('job', {
  ref: 'Job',
  localField: 'jobId',
  foreignField: '_id',
  justOne: true
});

disputeSchema.virtual('opener', {
  ref: 'User',
  localField: 'openedBy',
  foreignField: '_id',
  justOne: true
});

disputeSchema.virtual('resolver', {
  ref: 'User',
  localField: 'resolvedBy',
  foreignField: '_id',
  justOne: true
});

// Pre-save: Ensure messages are added correctly (via controller)
disputeSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedBy) {
    return next(new Error('Dispute must be resolved by an admin'));
  }
  next();
});

// Static method to add message to dispute (call from Socket.io handler)
disputeSchema.statics.addMessage = async function(jobId, senderId, content) {
  const dispute = await this.findOne({ jobId });
  if (!dispute) {
    return new Error('Dispute not found for this job');
  }
  dispute.messages.push({ sender: senderId, content });
  await dispute.save();
  // Emit real-time to participants (in controller: io.to(`dispute-${dispute._id}`).emit('newMessage', message))
  return dispute;
};

// Method to resolve dispute (admin only, updates status and notifies)
disputeSchema.methods.resolve = async function(resolverId, resolution) {
  this.status = 'resolved';
  this.resolvedBy = resolverId;
  this.resolution = resolution;
  await this.save();
  // Log to Activity model (Activity.logActivity('dispute_resolved', resolverId, { disputeId: this._id, jobId: this.jobId }))
  return this;
};

module.exports = mongoose.model('Dispute', disputeSchema);