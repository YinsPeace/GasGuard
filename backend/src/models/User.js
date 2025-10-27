const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  telegramChatId: {
    type: String,
    default: null
  },
  gasThreshold: {
    type: Number,
    default: 50.0
  },
  alertsEnabled: {
    type: Boolean,
    default: true
  },
  bestTimeAlerts: {
    type: Boolean,
    default: true
  },
  trendAlerts: {
    type: Boolean,
    default: true
  },
  connectedAt: {
    type: Date,
    default: Date.now
  },
  lastAlerts: {
    threshold: { type: Number, default: 0 },
    bestTime: { type: Number, default: 0 },
    trend: { type: Number, default: 0 }
  },
  subscriptionStatus: {
    isSubscribed: { type: Boolean, default: false },
    status: { type: String, default: 'none' },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    startedAt: Date,
    trialEnd: Date,
    currentPeriodEnd: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
