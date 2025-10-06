// Technician.js - Extends User model for technician role in FixItNow
// Additional fields: services (array for fuzzy search), proofs (aadhar base64 upload via Multer), availability (status for Redis SETEX cache, e.g., 'tech:123:busy'), rating (weighted average from reviews), premium (subscription Boolean)
// Indexes: Text index on services for MongoDB fuzzy search, geospatial on location for Leaflet maps/nearby techs
// Compatibility: Redis for availability caching (e.g., SETEX tech:{id}:busy {duration}), admin approval via status
const mongoose = require('mongoose');
const { Schema } = mongoose;

const technicianSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  services: [{
    type: Schema.Types.ObjectId,
    ref: 'ServiceCategory',
    required: [true, 'At least one service is required']
  }],
  proofs: {
    aadhar: {
      type: String, // Base64 encoded image from Multer upload
      required: [true, 'Aadhar proof is required for verification'],
      match: [/^data:image\/(jpeg|png|pdf);base64,/, 'Invalid base64 image format']
    }
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: {
      type: [Number], // [longitude, latitude] for GeoJSON
      required: [true, 'Location coordinates are required'],
      index: '2dsphere' // Geospatial index for nearby searches with Leaflet
    }
  },
  availability: {
    status: {
      type: String,
      enum: ['available', 'busy'],
      default: 'available'
    },
    nextAvailable: {
      type: Date // For freeze mode, e.g., busy till job end (synced with Redis SETEX)
    }
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  premium: {
    type: Boolean,
    default: false // Admin-managed subscription
  },
  approved: {
    type: Boolean,
    default: false // Admin approval after Aadhar review
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  discriminatorKey: 'role' // For Mongoose inheritance
});

// Indexes for performance and search
technicianSchema.index({ services: 1 }); // Index on service refs for queries
technicianSchema.index({ approved: 1, rating: -1 }); // For admin approval queue and sorting by rating

// Virtual for populating user base data
technicianSchema.virtual('userData', {
  ref: 'User',
  localField: '_id',
  foreignField: '_id',
  justOne: true
});

// Pre-save: Update availability from Redis if needed (future integration)
technicianSchema.pre('save', function(next) {
  if (this.role !== 'tech') return next();
  // Example: Sync with Redis, but actual sync in controllers/utils
  next();
});

// Method to calculate weighted average rating (called on review updates)
technicianSchema.methods.updateRating = function(newRating) {
  // Weighted logic: recent reviews weigh more (implement in job controller)
  this.rating = ((this.rating * (this.reviewsCount || 0)) + newRating) / ((this.reviewsCount || 0) + 1);
  this.reviewsCount = (this.reviewsCount || 0) + 1;
  return this.save();
};

module.exports = mongoose.model('Technician', technicianSchema);