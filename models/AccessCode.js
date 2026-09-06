const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const accessCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    default: () => uuidv4().substring(0, 12).toUpperCase(),
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tier: {
    type: String,
    enum: ['3-hours', '6-hours', '24-hours'],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  usedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: Date,
  gameUsed: String,
  paymentReference: String,
});

// Set expiration time based on tier
accessCodeSchema.pre('save', function (next) {
  if (!this.isNew) return next();
  
  const now = new Date();
  let expirationHours = 3;
  
  if (this.tier === '6-hours') expirationHours = 6;
  if (this.tier === '24-hours') expirationHours = 24;
  
  this.expiresAt = new Date(now.getTime() + expirationHours * 60 * 60 * 1000);
  next();
});

module.exports = mongoose.model('AccessCode', accessCodeSchema);
