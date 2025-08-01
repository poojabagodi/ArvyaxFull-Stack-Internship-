# 🧘‍♀️ Wellness Platform

A full-stack wellness session platform where users can create, share, and discover mindfulness content including meditation, yoga, and relaxation sessions.

## ✨ Features

- **User Authentication** - Secure registration and login
- **Session Management** - Create, edit, and publish wellness sessions
- **Video Content** - Upload videos or embed YouTube links
- **Draft System** - Auto-save drafts with manual save options
- **Public Discovery** - Browse published sessions from the community
- **Responsive Design** - Beautiful gradient UI with smooth animations
- **Real-time Updates** - Live session status and auto-save functionality

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Hooks
- React Router for navigation  
- Tailwind CSS for styling
- Context API for state management

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB running locally or MongoDB Atlas
- npm or yarn

### Backend Setup

1. **Clone and install dependencies:**
```bash
cd wellness-platform-backend
npm install
```

2. **Create `.env` file:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wellness-platform
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

3. **Start the backend:**
```bash
npm run dev
```
Backend runs on `http://localhost:5000`

### Frontend Setup

1. **Install dependencies:**
```bash
cd wellness-platform-frontend
npm install
```

2. **Create `.env` file:**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

3. **Update API integration** (if using existing code):
   - Replace mock API functions with real API calls
   - Add token storage in AuthProvider
   - Fix missing state declarations in Dashboard

4. **Start the frontend:**
```bash
npm start
```
Frontend runs on `http://localhost:3000`

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Sessions
- `GET /api/sessions/public` - Get all published sessions
- `GET /api/sessions/my` - Get user's sessions
- `GET /api/sessions/my/:id` - Get specific session
- `POST /api/sessions/draft` - Save session as draft
- `POST /api/sessions/publish` - Publish session
- `DELETE /api/sessions/:id` - Delete session

## 🎯 Usage

1. **Register/Login** - Create an account or sign in
2. **Browse Sessions** - Discover wellness content on the dashboard
3. **Create Content** - Use the editor to create new sessions
4. **Manage Sessions** - View drafts and published content in "My Sessions"
5. **Watch Videos** - Click any session to watch embedded content

## 📱 Key Components

- **Authentication System** - Secure login with JWT tokens
- **Session Editor** - Rich editor with auto-save functionality
- **Video Modal** - Full-screen video playback
- **Dashboard** - Browse and filter wellness sessions
- **My Sessions** - Manage personal content (drafts/published)

## 🔧 Development

### Backend Scripts
```bash
npm run dev      # Development with nodemon
npm start        # Production
npm run lint     # Code linting
```

### Frontend Scripts
```bash
npm start        # Development server
npm run build    # Production build
npm test         # Run tests
```

## 🗄️ Database Schema

**User Model:**
- email (unique, required)
- password (hashed, required)
- timestamps

**Session Model:**
- user_id (ObjectId, ref to User)
- title (required)
- description
- tags (array)
- video_url
- thumbnail
- duration
- status (draft/published)
- timestamps

## 🔐 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- CORS configuration
- Input validation and sanitization
- Protected routes and middleware

## 🎨 UI Features

- Modern gradient design
- Smooth animations and transitions
- Responsive mobile-first design
- Loading states and error handling
- Auto-save with visual feedback
- Drag-and-drop file upload

## 🚀 Production Deployment

1. **Environment Variables** - Set production values
2. **Database** - Use MongoDB Atlas for production
3. **Build Frontend** - Run `npm run build`
4. **Deploy Backend** - Use services like Heroku, Railway, or DigitalOcean
5. **Deploy Frontend** - Use Vercel, Netlify, or similar

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- Unsplash for beautiful wellness imagery
- YouTube for video embedding capabilities
- Tailwind CSS for the amazing utility-first CSS framework


**Happy Wellness Journey! 🧘‍♂️✨**