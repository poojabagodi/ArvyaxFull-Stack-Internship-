// server.js - Complete MongoDB Backend
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// ===== MODELS =====
// User Model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

// Session Model
const sessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  tags: [String],
  video_url: String,
  thumbnail: String,
  duration: String,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' }
}, { timestamps: true });

const Session = mongoose.model('Session', sessionSchema);

// ===== MIDDLEWARE =====
const allowedOrigins = [
  'https://wellness-find-your-inner-peace.onrender.com',
  'https://wellness-find-your-peace.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// ===== AUTH MIDDLEWARE =====
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wellness-secret-key');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ===== HELPER FUNCTIONS =====
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'wellness-secret-key', { 
    expiresIn: '7d' 
  });
};

// ===== DATABASE CONNECTION =====
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wellness')
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    seedDefaultSessions();
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Seed default sessions if none exist
const seedDefaultSessions = async () => {
  try {
    const sessionCount = await Session.countDocuments();
    if (sessionCount === 0) {
      // Create a default user for sample sessions
      let defaultUser = await User.findOne({ email: 'wellness@team.com' });
      if (!defaultUser) {
        defaultUser = new User({
          email: 'wellness@team.com',
          password: 'defaultpassword123'
        });
        await defaultUser.save();
      }

      const defaultSessions = [
        {
          title: 'Morning Mindfulness Meditation',
          tags: ['meditation', 'morning', 'mindfulness'],
          video_url: 'https://www.youtube.com/embed/ZToicYcHIOU',
          thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop',
          description: 'Start your day with peace and clarity through this guided morning meditation.',
          duration: '10 min',
          user_id: defaultUser._id,
          status: 'published'
        },
        {
          title: 'Gentle Yoga Flow for Beginners',
          tags: ['yoga', 'beginner', 'gentle'],
          video_url: 'https://www.youtube.com/embed/v7AYKMP6rOE',
          thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=225&fit=crop',
          description: 'A soothing yoga flow perfect for beginners to build flexibility and strength.',
          duration: '20 min',
          user_id: defaultUser._id,
          status: 'published'
        },
        {
          title: 'Deep Breathing for Stress Relief',
          tags: ['breathing', 'stress-relief', 'relaxation'],
          video_url: 'https://www.youtube.com/embed/tybOi4hjZFQ',
          thumbnail: 'https://images.unsplash.com/photo-1515375033182-a1d4b5b8c8f7?w=400&h=225&fit=crop',
          description: 'Learn powerful breathing techniques to reduce stress and anxiety.',
          duration: '8 min',
          user_id: defaultUser._id,
          status: 'published'
        }
      ];

      await Session.insertMany(defaultSessions);
      console.log('✅ Default sessions created');
    }
  } catch (error) {
    console.error('❌ Error seeding default sessions:', error);
  }
};

// ===== AUTH ROUTES =====
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create user
    const user = new User({ email, password });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    console.log('✅ User registered:', email);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { _id: user._id, email: user.email }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    console.log('✅ User logged in:', email);

    res.json({
      message: 'Login successful',
      token,
      user: { _id: user._id, email: user.email }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ===== SESSION ROUTES =====
app.get('/api/sessions/public', async (req, res) => {
  try {
    const sessions = await Session.find({ status: 'published' })
      .populate('user_id', 'email')
      .sort({ createdAt: -1 });

    res.json({ sessions });
  } catch (error) {
    console.error('❌ Get public sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

app.get('/api/sessions/my', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ user_id: req.user._id })
      .populate('user_id', 'email')
      .sort({ updatedAt: -1 });

    res.json({ sessions });
  } catch (error) {
    console.error('❌ Get my sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch your sessions' });
  }
});

app.get('/api/sessions/my/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      user_id: req.user._id
    }).populate('user_id', 'email');

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('❌ Get session error:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

app.post('/api/sessions/draft', auth, async (req, res) => {
  try {
    const { id, title, tags, video_url, thumbnail, description, duration } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    let session;

    if (id) {
      // Update existing session
      session = await Session.findOneAndUpdate(
        { _id: id, user_id: req.user._id },
        {
          title: title.trim(),
          tags: Array.isArray(tags) ? tags : [],
          video_url: video_url || '',
          thumbnail: thumbnail || '',
          description: description || '',
          duration: duration || '',
          status: 'draft'
        },
        { new: true, runValidators: true }
      ).populate('user_id', 'email');

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
    } else {
      // Create new session
      session = new Session({
        user_id: req.user._id,
        title: title.trim(),
        tags: Array.isArray(tags) ? tags : [],
        video_url: video_url || '',
        thumbnail: thumbnail || '',
        description: description || '',
        duration: duration || '',
        status: 'draft'
      });

      await session.save();
      await session.populate('user_id', 'email');
    }

    console.log('✅ Draft saved:', session.title);
    res.json({ session });
  } catch (error) {
    console.error('❌ Save draft error:', error);
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

app.post('/api/sessions/publish', auth, async (req, res) => {
  try {
    const { id, title, tags, video_url, thumbnail, description, duration } = req.body;

    // Validation for publishing
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required for publishing' });
    }

    if (!video_url || !video_url.trim()) {
      return res.status(400).json({ error: 'Video URL is required for publishing' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Description is required for publishing' });
    }

    let session;

    if (id) {
      // Update existing session
      session = await Session.findOneAndUpdate(
        { _id: id, user_id: req.user._id },
        {
          title: title.trim(),
          tags: Array.isArray(tags) ? tags : [],
          video_url: video_url.trim(),
          thumbnail: thumbnail || '',
          description: description.trim(),
          duration: duration || '',
          status: 'published'
        },
        { new: true, runValidators: true }
      ).populate('user_id', 'email');

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
    } else {
      // Create new session
      session = new Session({
        user_id: req.user._id,
        title: title.trim(),
        tags: Array.isArray(tags) ? tags : [],
        video_url: video_url.trim(),
        thumbnail: thumbnail || '',
        description: description.trim(),
        duration: duration || '',
        status: 'published'
      });

      await session.save();
      await session.populate('user_id', 'email');
    }

    console.log('✅ Session published:', session.title);
    res.json({ session });
  } catch (error) {
    console.error('❌ Publish session error:', error);
    res.status(500).json({ error: 'Failed to publish session' });
  }
});

app.delete('/api/sessions/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    console.log('✅ Session deleted:', session.title);
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('❌ Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// ===== HEALTH CHECK =====
app.get('/health', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const sessionCount = await Session.countDocuments();
    
    res.json({
      message: 'Wellness Platform API is running!',
      timestamp: new Date().toISOString(),
      mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      users: userCount,
      sessions: sessionCount
    });
  } catch (error) {
    res.json({
      message: 'API is running but database query failed',
      timestamp: new Date().toISOString(),
      mongodb: 'Error',
      error: error.message
    });
  }
});

// ===== ERROR HANDLERS =====
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    error: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
});

// ===== SERVER START =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 MongoDB Connection: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
});