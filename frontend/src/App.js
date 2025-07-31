import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useParams } from 'react-router-dom';

// ==========================================
// MOCK API SERVICE (Replace with real API)
// ==========================================
const API_BASE =  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Mock data for default sessions
const DEFAULT_SESSIONS = [
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
    status: 'published',
    isDefault: true
  }
];


export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    
    return await response.json();
  },
  
  login: async (userData) => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    return await response.json();
  },
};



export const sessionAPI = {
  getPublicSessions: async () => {
    const response = await fetch(`${API_BASE}/api/sessions/public`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }
    
    const data = await response.json();
    return { data: { sessions: data.sessions || [] } };
  },
  
  getMySessions: async () => {
    const token = JSON.parse(sessionStorage.getItem('user'))?.token;
    
    const response = await fetch(`${API_BASE}/api/sessions/my`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch your sessions');
    }
    
    const data = await response.json();
    return { data: { sessions: data.sessions || [] } };
  },
  
  getMySession: async (id) => {
    const token = JSON.parse(sessionStorage.getItem('user'))?.token;
    
    const response = await fetch(`${API_BASE}/api/sessions/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch session');
    }
    
    const data = await response.json();
    return { data: { session: data.session } };
  },
  
  saveDraft: async (sessionData) => {
    const token = JSON.parse(sessionStorage.getItem('user'))?.token;
    const method = sessionData.id ? 'PUT' : 'POST';
    const url = sessionData.id 
      ? `${API_BASE}/api/sessions/${sessionData.id}`
      : `${API_BASE}/api/sessions`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...sessionData,
        status: 'draft'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save draft');
    }
    
    const data = await response.json();
    return { data: { session: data.session } };
  },
  
  publishSession: async (sessionData) => {
    const token = JSON.parse(sessionStorage.getItem('user'))?.token;
    const method = sessionData.id ? 'PUT' : 'POST';
    const url = sessionData.id 
      ? `${API_BASE}/api/sessions/${sessionData.id}`
      : `${API_BASE}/api/sessions`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...sessionData,
        status: 'published'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to publish session');
    }
    
    const data = await response.json();
    return { data: { session: data.session } };
  },
  
  deleteSession: async (id) => {
    const token = JSON.parse(sessionStorage.getItem('user'))?.token;
    
    const response = await fetch(`${API_BASE}/api/sessions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete session');
    }
    
    return { data: { success: true } };
  },
};

// ==========================================
// AUTH CONTEXT
// ==========================================
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);


  const login = (token, userData) => {
  const userWithToken = { ...userData, token };
  sessionStorage.setItem('user', JSON.stringify(userWithToken));
  setUser(userWithToken);
};


  const logout = () => {
    sessionStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ==========================================
// HOOKS
// ==========================================
const useAutoSave = (data, onSave, delay = 5000) => {
  const timeoutRef = useRef();
  const previousDataRef = useRef();

  useEffect(() => {
    if (JSON.stringify(data) === JSON.stringify(previousDataRef.current)) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onSave(data);
      previousDataRef.current = data;
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, delay]);
};

// ==========================================
// COMPONENTS
// ==========================================

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
      type === 'success' 
        ? 'bg-green-500 text-white' 
        : type === 'error' 
        ? 'bg-red-500 text-white' 
        : 'bg-blue-500 text-white'
    }`}>
      <div className="flex items-center">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
          ×
        </button>
      </div>
    </div>
  );
};

// Navigation Component
const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Wellness
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium">
              Dashboard
            </Link>
            <Link to="/my-sessions" className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium">
              My Sessions
            </Link>
            <Link to="/editor" className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium">
              Create Session
            </Link>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-purple-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/90 backdrop-blur-sm rounded-lg mt-2">
              <Link to="/" className="block px-3 py-2 text-gray-700 hover:text-purple-600">Dashboard</Link>
              <Link to="/my-sessions" className="block px-3 py-2 text-gray-700 hover:text-purple-600">My Sessions</Link>
              <Link to="/editor" className="block px-3 py-2 text-gray-700 hover:text-purple-600">Create Session</Link>
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-800">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Video Modal Component
const VideoModal = ({ session, onClose }) => {
  if (!session) return null;

  const getEmbedUrl = (url) => {
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">{session.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="aspect-video">
          <iframe
            src={getEmbedUrl(session.video_url)}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
            title={session.title}
          />
        </div>
        
        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {session.tags?.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm rounded-full border border-purple-200"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <p className="text-gray-600 mb-4">{session.description}</p>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Duration: {session.duration}</span>
            <span>by {session.user_id?.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Login Component
const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      login(response.token, response.user); 
      navigate('/');
    } catch (error) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">W</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-gray-600 mt-2">Sign in to your wellness journey</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-600 hover:text-purple-800 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Register Component
const Register = () => {
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
     const response = await authAPI.register({
  email: formData.email,
  password: formData.password
});
      login(response.token, response.user); 
      navigate('/');
    } catch (error) {
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">W</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Join Wellness
            </h2>
            <p className="text-gray-600 mt-2">Start your mindfulness journey</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 hover:text-purple-800 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await sessionAPI.getPublicSessions();
      setSessions(response.data.sessions || []);
    } catch (error) {
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Discover Wellness Sessions
          </h1>
          <p className="text-xl text-gray-600">Find inner peace through guided meditation and yoga</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sessions.map((session, index) => (
            <div
              key={session._id}
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/20 overflow-hidden cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setSelectedSession(session)}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={session.thumbnail}
                  alt={session.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-1 truncate">{session.title}</h3>
                  <p className="text-purple-100 text-sm">by {session.user_id?.email}</p>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-black/50 text-white text-xs rounded-full">
                    {session.duration}
                  </span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{session.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {session.tags?.slice(0, 3).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm rounded-full border border-purple-200"
                    >
                      {tag}
                    </span>
                  ))}
                  {session.tags?.length > 3 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                      +{session.tags.length - 3}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </span>
                  <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105">
                    Watch Now
                    <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">No sessions yet</h3>
            <p className="text-gray-600 mb-8">Be the first to create and share a wellness session</p>
            <Link
              to="/editor"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
            >
              Create First Session
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {selectedSession && (
        <VideoModal 
          session={selectedSession} 
          onClose={() => setSelectedSession(null)} 
        />
      )}
    </div>
  );
};

// My Sessions Component
// My Sessions Component - NO LOADING
const MySessions = () => {
 
  const [sessions, setSessions] = useState([]);
 
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const navigate = useNavigate();

  
  
  useEffect(() => {
  
    loadMySessions();
  }, []);

  const loadMySessions = async () => {
    try {
      const response = await sessionAPI.getMySessions();
      setSessions(response.data.sessions || []);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error loading sessions:', error);
      
      // For development: If backend is not available, show empty state instead of error
      if (error.message.includes('fetch')) {
        setSessions([]); // Set empty array when backend is not available
        setError(''); // Don't show error for missing backend
      } else {
        setError('Failed to load your sessions');
        setSessions([]);
 
 
      }
 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;

    try {
      await sessionAPI.deleteSession(id);
      setSessions(sessions.filter(s => s._id !== id));
      setToast({ message: 'Session deleted successfully', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to delete session', type: 'error' });
    }
  };

  const drafts = sessions.filter(s => s.status === 'draft');
  const published = sessions.filter(s => s.status === 'published');

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
      <Navigation />
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            My Sessions
          </h1>
          <Link
            to="/editor"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
          >
            New Session
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Show empty state only if no sessions at all */}
        {sessions.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">No sessions yet</h3>
            <p className="text-gray-600 mb-8">Start creating your wellness sessions to share with the community</p>
            <Link
              to="/editor"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
            >
              Create First Session
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
        )}

        {/* Only show sections if there are sessions */}
        {sessions.length > 0 && (
          <>
            {/* Drafts Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Drafts ({drafts.length})
              </h2>
              
              {drafts.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20">
                  <p className="text-gray-600">No drafts yet. Start creating your first session!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {drafts.map((session, index) => (
                    <SessionCard
                      key={session._id}
                      session={session}
                      onEdit={() => navigate(`/editor/${session._id}`)}
                      onDelete={() => handleDelete(session._id)}
                      onWatch={() => setSelectedSession(session)}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Published Section */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Published ({published.length})
              </h2>
              
              {published.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20">
                  <p className="text-gray-600">No published sessions yet. Publish your first session to share with the community!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {published.map((session, index) => (
                    <SessionCard
                      key={session._id}
                      session={session}
                      onEdit={() => navigate(`/editor/${session._id}`)}
                      onDelete={() => handleDelete(session._id)}
                      onWatch={() => setSelectedSession(session)}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {selectedSession && (
        <VideoModal 
          session={selectedSession} 
          onClose={() => setSelectedSession(null)} 
        />
      )}
    </div>
  );
};

// Session Card Component
// const SessionCard = ({ session, onEdit, onDelete, onWatch, index }) => {
//   return (
//     <div
//       className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/20 overflow-hidden"
//       style={{ animationDelay: `${index * 0.1}s` }}
//     >
//       <div className="relative h-32 overflow-hidden cursor-pointer" onClick={onWatch}>
//         <img
//           src={session.thumbnail || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop'}
//           alt={session.title}
//           className="w-full h-full object-cover"
//         />
//         <div className={`absolute inset-0 ${
//           session.status === 'draft' 
//             ? 'bg-gradient-to-t from-orange-600/50 to-transparent'
//             : 'bg-gradient-to-t from-green-600/50 to-transparent'
//         }`}></div>
//         <div className="absolute top-4 right-4">
//           <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//             session.status === 'draft'
//               ? 'bg-orange-500 text-white'
//               : 'bg-green-500 text-white'
//           }`}>
//             {session.status === 'draft' ? 'Draft' : 'Published'}
//           </span>
//         </div>
//         <div className="absolute bottom-4 left-4 right-4">
//           <h3 className="text-lg font-bold text-white truncate">{session.title}</h3>
//         </div>
//         {session.video_url && (
//           <div className="absolute inset-0 flex items-center justify-center">
//             <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
//               <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M8 5v14l11-7z"/>
//               </svg>
//             </div>
//           </div>
//         )}
//       </div>
      
//       <div className="p-6">
//         <div className="flex flex-wrap gap-2 mb-4">
//           {session.tags?.slice(0, 3).map((tag, tagIndex) => (
//             <span
//               key={tagIndex}
//               className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs rounded-full border border-purple-200"
//             >
//               {tag}
//             </span>
//           ))}
//           {/* {session.tags?.length > 3 && (
//             <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
//               +{session.tags.length - 3} more
//             </span>
//           )} */}
//           {(Array.isArray(session.tags)
//   ? session.tags
//   : typeof session.tags === 'string'
//     ? session.tags.split(',').map(t => t.trim()).filter(Boolean)
//     : []
// ).slice(0, 3).map((tag, tagIndex) => (
//   <span
//     key={tagIndex}
//     className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs rounded-full border border-purple-200"
//   >
//     {tag}
//   </span>
// ))}

// {((Array.isArray(session.tags)
//   ? session.tags
//   : typeof session.tags === 'string'
//     ? session.tags.split(',').map(t => t.trim()).filter(Boolean)
//     : []).length > 3) && (
//   <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
//     +{(Array.isArray(session.tags)
//       ? session.tags
//       : typeof session.tags === 'string'
//         ? session.tags.split(',').map(t => t.trim()).filter(Boolean)
//         : []
//     ).length - 3} more
//   </span>
// )}

//         </div>
        
//         <div className="flex items-center justify-between mb-4">
//           <span className="text-sm text-gray-500">
//             {new Date(session.updatedAt).toLocaleDateString()}
//           </span>
//           {session.duration && (
//             <span className="text-sm text-purple-600 font-medium">
//               {session.duration}
//             </span>
//           )}
//         </div>
        
//         <div className="flex space-x-2">
//           <button
//             onClick={onEdit}
//             className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-sm font-medium"
//           >
//             Edit
//           </button>
//           {session.video_url && (
//             <button
//               onClick={onWatch}
//               className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all duration-200 text-sm font-medium"
//             >
//               Watch
//             </button>
//           )}
//           <button
//             onClick={onDelete}
//             className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-all duration-200 text-sm font-medium"
//           >
//             Delete
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
// Session Card Component - FIXED VERSION
const SessionCard = ({ session, onEdit, onDelete, onWatch, index }) => {
  // Helper function to safely process tags
  const processTags = (tags) => {
    if (Array.isArray(tags)) {
      return tags;
    }
    if (typeof tags === 'string') {
      return tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    return [];
  };

  const sessionTags = processTags(session.tags);

  return (
    <div
      className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/20 overflow-hidden"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative h-32 overflow-hidden cursor-pointer" onClick={onWatch}>
        <img
          src={session.thumbnail || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop'}
          alt={session.title}
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 ${
          session.status === 'draft' 
            ? 'bg-gradient-to-t from-orange-600/50 to-transparent'
            : 'bg-gradient-to-t from-green-600/50 to-transparent'
        }`}></div>
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            session.status === 'draft'
              ? 'bg-orange-500 text-white'
              : 'bg-green-500 text-white'
          }`}>
            {session.status === 'draft' ? 'Draft' : 'Published'}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-lg font-bold text-white truncate">{session.title}</h3>
        </div>
        {session.video_url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {sessionTags.slice(0, 3).map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs rounded-full border border-purple-200"
            >
              {tag}
            </span>
          ))}
          {sessionTags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{sessionTags.length - 3} more
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            {new Date(session.updatedAt).toLocaleDateString()}
          </span>
          {session.duration && (
            <span className="text-sm text-purple-600 font-medium">
              {session.duration}
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-sm font-medium"
          >
            Edit
          </button>
          {session.video_url && (
            <button
              onClick={onWatch}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              Watch
            </button>
          )}
          <button
            onClick={onDelete}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-all duration-200 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
// File Upload Component
const FileUpload = ({ onVideoSelect, currentVideo }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files[0] && files[0].type.startsWith('video/')) {
      const videoUrl = URL.createObjectURL(files[0]);
      onVideoSelect(videoUrl, files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files[0] && files[0].type.startsWith('video/')) {
      const videoUrl = URL.createObjectURL(files[0]);
      onVideoSelect(videoUrl, files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
          dragActive 
            ? 'border-purple-500 bg-purple-50' 
            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-25'
        }`}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-700 mb-2">Upload your wellness video</p>
            <p className="text-sm text-gray-500 mb-4">Drag and drop or click to select</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
            >
              Choose Video File
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {currentVideo && (
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <p className="text-sm text-gray-600 mb-2">Current video:</p>
          <video
            src={currentVideo}
            controls
            className="w-full max-h-48 rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

// Session Editor Component
const SessionEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState({
    title: '',
    tags: '',
    video_url: '',
    thumbnail: '',
    description: '',
    duration: ''
  });
  const [videoFile, setVideoFile] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Auto-save function
  const handleAutoSave = async (data) => {
    if (!data.title.trim()) return;
    
    try {
      setSaveStatus('Saving...');
      await sessionAPI.saveDraft({ ...data, id });
      setSaveStatus('Auto-saved ✓');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('Save failed ✗');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // Use auto-save hook
  useAutoSave(session, handleAutoSave, 5000);

  useEffect(() => {
    if (id) {
      loadSession();
    }
  }, [id]);

  const loadSession = async () => {
    setLoading(true);
    try {
      const response = await sessionAPI.getMySession(id);
      const data = response.data.session;
      setSession({
        title: data.title,
        tags: data.tags.join(', '),
        video_url: data.video_url || '',
        thumbnail: data.thumbnail || '',
        description: data.description || '',
        duration: data.duration || ''
      });
    } catch (error) {
      setToast({ message: 'Error loading session', type: 'error' });
      navigate('/my-sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSession({
      ...session,
      [e.target.name]: e.target.value
    });
  };

  const handleVideoSelect = (videoUrl, file) => {
    setSession({
      ...session,
      video_url: videoUrl
    });
    setVideoFile(file);
  };

  const handleSaveDraft = async () => {
    if (!session.title.trim()) {
      setToast({ message: 'Title is required', type: 'error' });
      return;
    }

    try {
      const tags = session.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      await sessionAPI.saveDraft({ ...session, tags, id });
      setToast({ message: 'Draft saved successfully!', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to save draft', type: 'error' });
    }
  };

  const handlePublish = async () => {
    if (!session.title.trim() || !session.video_url.trim() || !session.description.trim()) {
      setToast({ message: 'Title, video, and description are required for publishing', type: 'error' });
      return;
    }

    try {
      const tags = session.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      await sessionAPI.publishSession({ ...session, tags, id });
      setToast({ message: 'Session published successfully!', type: 'success' });
      setTimeout(() => navigate('/my-sessions'), 2000);
    } catch (error) {
      setToast({ message: 'Failed to publish session', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
      <Navigation />
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-white">
                {id ? 'Edit Session' : 'Create New Session'}
              </h1>
              {saveStatus && (
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                  saveStatus.includes('✓') 
                    ? 'bg-green-500/20 text-green-100' 
                    : saveStatus.includes('✗')
                    ? 'bg-red-500/20 text-red-100'
                    : 'bg-blue-500/20 text-blue-100'
                }`}>
                  {saveStatus}
                </div>
              )}
            </div>
          </div>

          <div className="p-8">
            <form className="space-y-8">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Session Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={session.title}
                  onChange={handleChange}
                  placeholder="Enter your session title (e.g., 'Morning Mindfulness')"
                  className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 text-lg"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={session.description}
                  onChange={handleChange}
                  placeholder="Describe your wellness session..."
                  rows={4}
                  className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 text-lg resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Duration
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={session.duration}
                    onChange={handleChange}
                    placeholder="e.g., 10 min, 30 min"
                    className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 text-lg"
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    name="thumbnail"
                    value={session.thumbnail}
                    onChange={handleChange}
                    placeholder="https://example.com/thumbnail.jpg"
                    className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 text-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={session.tags}
                  onChange={handleChange}
                  placeholder="yoga, meditation, wellness, mindfulness (comma-separated)"
                  className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 text-lg"
                />
                <p className="text-sm text-gray-500 mt-2">Separate tags with commas</p>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Video {!id && '*'}
                </label>
                
                <div className="space-y-4">
                  <FileUpload 
                    onVideoSelect={handleVideoSelect}
                    currentVideo={session.video_url}
                  />
                  
                  <div className="text-center text-gray-500">
                    <span>OR</span>
                  </div>
                  
                  <input
                    type="url"
                    name="video_url"
                    value={session.video_url}
                    onChange={handleChange}
                    placeholder="Paste YouTube URL or video link"
                    className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 text-lg"
                  />
                </div>
                
                <p className="text-sm text-gray-500 mt-2">
                  {id ? 'Upload a video file or provide a video URL' : 'Required for publishing - upload video or provide URL'}
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">✨ Auto-save Enabled</h3>
                <p className="text-purple-700">
                  Your changes are automatically saved as a draft every 5 seconds after you stop typing.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-4 px-8 rounded-2xl font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 transform hover:scale-105 text-lg"
                >
                  💾 Save as Draft
                </button>
                
                <button
                  type="button"
                  onClick={handlePublish}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-8 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 text-lg"
                >
                  🚀 Publish Session
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/my-sessions')}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-4 px-8 rounded-2xl font-semibold transition-all duration-200 text-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/my-sessions" element={
              <ProtectedRoute>
                <MySessions />
              </ProtectedRoute>
            } />
            <Route path="/editor/:id?" element={
              <ProtectedRoute>
                <SessionEditor />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;