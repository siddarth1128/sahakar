// ServiceCategory.js - Model for dynamic service types in FixItNow
// Fields: name, description, basePriceRange (min-max), icon (URL/base64), active (admin toggle)
// Indexes: On name for quick search, active for filtering available services
// Usage: Referenced in Technician.services[], used in search/booking, admin CRUD
const mongoose = require('mongoose');
const { Schema } = mongoose;

const serviceCategorySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Service name cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  basePriceRange: {
    min: {
      type: Number,
      required: [true, 'Minimum price is required'],
      min: [0, 'Price cannot be negative']
    },
    max: {
      type: Number,
      required: [true, 'Maximum price is required'],
      min: [0, 'Price cannot be negative']
    }
  },
  icon: {
    type: String, // URL or base64 for Material-UI icons in frontend
    default: null
  },
  active: {
    type: Boolean,
    default: true // Admin can deactivate categories
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
serviceCategorySchema.index({ active: 1 });

// Static method to get active categories for frontend dropdown/search
serviceCategorySchema.statics.getActiveCategories = function() {
  return this.find({ active: true }).sort({ name: 1 });
};

module.exports = mongoose.model('ServiceCategory', serviceCategorySchema);