const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  tags: [{
    type: String,
    trim: true
  }],
  video_url: {
    type: String,
    trim: true
  },
  thumbnail: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  duration: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for performance
sessionSchema.index({ user_id: 1, status: 1 });
sessionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Session', sessionSchema);
