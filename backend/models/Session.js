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
    trim: true,
    lowercase: true
  }],
  json_file_url: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty for drafts
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid URL format'
    }
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

// ========== middleware/auth.js ==========
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ 
        error: 'Token is not valid.' 
      });
    }
    
    // Add user to request
    req.user = user;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Server error in authentication.' });
  }
};

module.exports = auth;

