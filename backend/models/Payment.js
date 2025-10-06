// Payment.js - Model for COD payments and receipts in FixItNow
// Fields: jobId (ref Job), amount, status (pending/paid/refunded), method ('COD'), receiptUrl (generated PDF), paidAt
// Indexes: On jobId unique, status for admin review
// Usage: On job completion, simulate COD, admin confirms/generates receipt via emailWorker, updates Job.paymentStatus
// Compatible with Activity.logActivity('payment_confirmed')
const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new Schema({
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job ID is required'],
    unique: true // One payment per job
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  method: {
    type: String,
    enum: ['COD'], // Only COD as per spec, no UPI yet
    default: 'COD',
    required: true
  },
  receiptUrl: {
    type: String, // URL to generated PDF receipt (via pdfkit or similar in utils)
    default: null
  },
  paidAt: {
    type: Date,
    default: null
  },
  confirmedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Admin who confirms payment
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
paymentSchema.index({ jobId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paidAt: 1 });

// Virtuals
paymentSchema.virtual('job', {
  ref: 'Job',
  localField: 'jobId',
  foreignField: '_id',
  justOne: true
});

// Method to confirm payment (admin only, generates receipt)
paymentSchema.methods.confirmPayment = async function(adminId) {
  this.status = 'paid';
  this.paidAt = new Date();
  this.confirmedBy = adminId;
  // Generate receipt URL (in controller: use pdfkit to create PDF, upload to S3, set URL)
  // this.receiptUrl = await generateReceipt(this);
  await this.save();
  // Log activity and notify via RabbitMQ/email
  return this;
};

module.exports = mongoose.model('Payment', paymentSchema);