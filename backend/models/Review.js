// Review.js - Separate model for user reviews in FixItNow
// Fields: jobId (ref Job), reviewerId (ref User), techId (ref Technician), rating, comment, images (post-job uploads)
// Indexes: On techId for average rating calc, jobId unique (one review per job)
// Usage: Post-job submission, updates Technician.rating, displayed in profiles/search
// Compatible with Activity.logActivity('review_submitted')
const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job ID is required'],
    unique: true // One review per job
  },
  reviewerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewer ID is required']
  },
  techId: {
    type: Schema.Types.ObjectId,
    ref: 'Technician',
    required: [true, 'Technician ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  images: [{
    type: String, // URLs from cloud storage (S3/Multer), post-job uploads by tech
    validate: {
      validator: (v) => v.length <= 5, // Max 5 images
      message: 'Maximum 5 images allowed'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
reviewSchema.index({ techId: 1 }); // For tech average rating
reviewSchema.index({ createdAt: -1 }); // Recent reviews

// Virtuals
reviewSchema.virtual('job', {
  ref: 'Job',
  localField: 'jobId',
  foreignField: '_id',
  justOne: true
});

reviewSchema.virtual('reviewer', {
  ref: 'User',
  localField: 'reviewerId',
  foreignField: '_id',
  justOne: true
});

reviewSchema.virtual('technician', {
  ref: 'Technician',
  localField: 'techId',
  foreignField: '_id',
  justOne: true
});

// Static to calculate average rating for tech (call in queries)
reviewSchema.statics.getAverageRating = function(techId) {
  return this.aggregate([
    { $match: { techId: mongoose.Types.ObjectId(techId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Review', reviewSchema);