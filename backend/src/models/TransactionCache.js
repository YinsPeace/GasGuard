const mongoose = require('mongoose');

const transactionCacheSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Auto-delete cache entries older than 1 hour
transactionCacheSchema.index({ lastUpdated: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model('TransactionCache', transactionCacheSchema);
