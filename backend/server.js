const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// Middleware
const allowedOrigins = [
  'https://wellness-find-your-inner-peace.onrender.com',
  'https://wellness-find-your-peace.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
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

// In-memory storage (replace with MongoDB in production)
let users = [];
let sessions = [
  {
    _id: 'default-1',
    title: 'Morning Mindfulness Meditation',
    tags: ['meditation', 'morning', 'mindfulness'],
    video_url: 'https://www.youtube.com/embed/ZToicYcHIOU',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop',
    description: 'Start your day with peace and clarity through this guided morning meditation.',
    duration: '10 min',
    user_id: { email: 'Wellness Team' },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    status: 'published',
    isDefault: true
  },
  {
    _id: 'default-2',
    title: 'Gentle Yoga Flow for Beginners',
    tags: ['yoga', 'beginner', 'gentle'],
    video_url: 'https://www.youtube.com/embed/v7AYKMP6rOE',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=225&fit=crop',
    description: 'A soothing yoga flow perfect for beginners to build flexibility and strength.',
    duration: '20 min',
    user_id: { email: 'Wellness Team' },
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    status: 'published',
    isDefault: true
  },
  {
    _id: 'default-3',
    title: 'Deep Breathing for Stress Relief',
    tags: ['breathing', 'stress-relief', 'relaxation'],
    video_url: 'https://www.youtube.com/embed/tybOi4hjZFQ',
    thumbnail: 'https://images.unsplash.com/photo-1515375033182-a1d4b5b8c8f7?w=400&h=225&fit=crop',
    description: 'Learn powerful breathing techniques to reduce stress and anxiety.',
    duration: '8 min',
    user_id: { email: 'Wellness Team' },
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
    status: 'published',
    isDefault: true
  },
  {
    _id: 'default-4',
    title: 'Evening Relaxation & Sleep Meditation',
    tags: ['sleep', 'relaxation', 'evening'],
    video_url: 'https://www.youtube.com/embed/aXItOY0sLRY',
    thumbnail: 'https://images.unsplash.com/photo-1520637836862-4d197d17c23a?w=400&h=225&fit=crop',
    description: 'Wind down with this peaceful meditation designed to prepare you for restful sleep.',
    duration: '15 min',
    user_id: { email: 'Wellness Team' },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    status: 'published',
    isDefault: true
  }
];

// Helper functions
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'wellness-secret-key', { expiresIn: '7d' });
};

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wellness-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = {
      _id: generateId(),
      email,
      password: hashedPassword,
      createdAt: new Date()
    };

    users.push(user);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { _id: user._id, email: user.email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: { _id: user._id, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Session Routes
app.get('/api/sessions/public', (req, res) => {
  try {
    const publicSessions = sessions.filter(s => s.status === 'published');
    res.json({ sessions: publicSessions });
  } catch (error) {
    console.error('Get public sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

app.get('/api/sessions/my', verifyToken, (req, res) => {
  try {
    const userSessions = sessions.filter(s => s.user_id?._id === req.userId);
    res.json({ sessions: userSessions });
  } catch (error) {
    console.error('Get my sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch your sessions' });
  }
});

app.get('/api/sessions/:id', verifyToken, (req, res) => {
  try {
    const session = sessions.find(s => s._id === req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if user owns the session or it's published
    if (session.user_id?._id !== req.userId && session.status !== 'published') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

app.post('/api/sessions', verifyToken, (req, res) => {
  try {
    const { title, description, tags, video_url, thumbnail, duration } = req.body;

    const user = users.find(u => u._id === req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const session = {
      _id: generateId(),
      title,
      description,
      tags: Array.isArray(tags) ? tags : [],
      video_url: video_url || '',
      thumbnail: thumbnail || '',
      duration: duration || '',
      user_id: { _id: user._id, email: user.email },
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    sessions.push(session);
    res.status(201).json({ session });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

app.put('/api/sessions/:id', verifyToken, (req, res) => {
  try {
    const sessionIndex = sessions.findIndex(s => s._id === req.params.id);
    if (sessionIndex === -1) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = sessions[sessionIndex];
    if (session.user_id?._id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, description, tags, video_url, thumbnail, duration } = req.body;

    sessions[sessionIndex] = {
      ...session,
      title: title || session.title,
      description: description || session.description,
      tags: Array.isArray(tags) ? tags : session.tags,
      video_url: video_url !== undefined ? video_url : session.video_url,
      thumbnail: thumbnail !== undefined ? thumbnail : session.thumbnail,
      duration: duration !== undefined ? duration : session.duration,
      updatedAt: new Date()
    };

    res.json({ session: sessions[sessionIndex] });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

app.post('/api/sessions/publish', verifyToken, (req, res) => {
  try {
    const { title, description, tags, video_url, thumbnail, duration, id } = req.body;

    if (!title || !description || !video_url) {
      return res.status(400).json({ error: 'Title, description, and video are required' });
    }

    const user = users.find(u => u._id === req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let session;
    
    if (id) {
      // Update existing session
      const sessionIndex = sessions.findIndex(s => s._id === id);
      if (sessionIndex === -1) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const existingSession = sessions[sessionIndex];
      if (existingSession.user_id?._id !== req.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      sessions[sessionIndex] = {
        ...existingSession,
        title,
        description,
        tags: Array.isArray(tags) ? tags : [],
        video_url,
        thumbnail: thumbnail || existingSession.thumbnail,
        duration: duration || existingSession.duration,
        status: 'published',
        updatedAt: new Date()
      };

      session = sessions[sessionIndex];
    } else {
      // Create new session
      session = {
        _id: generateId(),
        title,
        description,
        tags: Array.isArray(tags) ? tags : [],
        video_url,
        thumbnail: thumbnail || '',
        duration: duration || '',
        user_id: { _id: user._id, email: user.email },
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      sessions.push(session);
    }

    res.status(201).json({ 
      message: 'Session published successfully',
      session 
    });
  } catch (error) {
    console.error('Publish session error:', error);
    res.status(500).json({ error: 'Failed to publish session' });
  }
});

app.delete('/api/sessions/:id', verifyToken, (req, res) => {
  try {
    const sessionIndex = sessions.findIndex(s => s._id === req.params.id);
    if (sessionIndex === -1) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = sessions[sessionIndex];
    if (session.user_id?._id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    sessions.splice(sessionIndex, 1);
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    message: 'Wellness Platform API is running!',
    timestamp: new Date().toISOString(),
    sessions: sessions.length,
    users: users.length
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    error: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Initial data: ${sessions.length} sessions, ${users.length} users`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});