const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ip: String,
  userAgent: String,
  browser: String,
  device: String,
  referer: String
}, { _id: false });

const urlSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalUrl: {
    type: String,
    required: [true, 'Original URL is required'],
    trim: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  alias: {
    type: String,
    default: null,
    trim: true,
    sparse: true
  },
  title: {
    type: String,
    default: null,
    trim: true
  },
  expiresAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  clicks: [clickSchema],
  totalClicks: {
    type: Number,
    default: 0
  },
  lastVisited: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Index for faster lookups
urlSchema.index({ shortCode: 1 });
urlSchema.index({ user: 1, createdAt: -1 });
urlSchema.index({ alias: 1 }, { sparse: true });

module.exports = mongoose.model('Url', urlSchema);
