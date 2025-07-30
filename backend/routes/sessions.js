const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true  // Index for faster queries
  },
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  json_file_url: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty for drafts
        return /^https?:\/\/.+/.test(v); // Basic URL validation
      },
      message: 'Invalid URL format'
    }
  },
  status: { 
    type: String, 
    enum: ['draft', 'published'], 
    default: 'draft',
    index: true  // Index for faster filtering
  }
}, { 
  timestamps: true 
});

// Compound index for user's sessions
sessionSchema.index({ user_id: 1, status: 1 });
sessionSchema.index({ status: 1, createdAt: -1 }); // For public sessions

module.exports = mongoose.model('Session', sessionSchema);