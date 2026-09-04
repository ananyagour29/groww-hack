const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  lastCheckedPrice: { type: Number, required: true },
  lastCheckedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);