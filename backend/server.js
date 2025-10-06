// server.js - Main server file for FixItNow MERN app
// Setup: Express, MongoDB, Redis, Socket.io for real-time, WebRTC for video calls
// Connections: Routes, middleware, utils/emailWorker for background processing
// Free-tier: MongoDB Atlas, Redis Labs, AWS (if used)
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');
// Simplified server without complex dependencies
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const techRoutes = require('./routes/tech');
const adminRoutes = require('./routes/admin');
const jobRoutes = require('./routes/job');
const paymentsRoutes = require('./routes/payments');

const { startWorkers } = require('./utils/emailWorker');

dotenv.config({ path: '.env' });
const app = express();
const server = http.createServer(app);
// Resolve allowed origins from env
const parseOrigins = (str) => (str || '').split(',').map(s => s.trim()).filter(Boolean);
const allowedOrigins = parseOrigins(process.env.CLIENT_URLS) ;
const fallbackOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
const corsOrigins = allowedOrigins.length ? allowedOrigins : [fallbackOrigin];

const io = socketIo(server, {
  cors: {
    origin: corsOrigins,
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));
app.use(helmet());
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'fixitnow-fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

const rateLimit = require('./middleware/rateLimit');
app.use(rateLimit.apiLimit);
app.use(passport.initialize());

// Configure Google Strategy for OAuth aligned with User schema
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder_google_client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder_google_client_secret',
    callbackURL: "/api/auth/google/callback",
    passReqToCallback: true,
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const tempRole = (req && req.session && req.session.tempRole) ? req.session.tempRole : 'user';
      const email = Array.isArray(profile.emails) && profile.emails.length ? profile.emails[0].value : undefined;
      const googleId = profile.id;

      let user = await User.findOne({ googleId });
      if (!user && email) {
        // Try by email if Google ID not linked yet
        user = await User.findOne({ email });
      }

      if (user) {
        // Link Google if missing and update missing name
        if (!user.googleId) user.googleId = googleId;
        if (!user.name && profile.displayName) user.name = profile.displayName;
        await user.save();
      } else {
        // Create new user
        user = new User({
          googleId,
          name: profile.displayName || (email ? email.split('@')[0] : 'Google User'),
          email,
          role: ['user', 'admin', 'tech'].includes(tempRole) ? tempRole : 'user',
        });
        await user.save();
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => User.findById(id).then(user => done(null, user)));

// Routes
app.get('/test', (req, res) => res.json({ msg: 'FixItNow Server Running' }));
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tech', techRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/job', jobRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/ai', require('./routes/ai'));
// Use a single canonical route for reviews
app.use('/api/chat', require('./routes/chat'));
app.use('/api/service-categories', require('./routes/serviceCategory'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/technicians', require('./routes/technicians'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join rooms for real-time updates
  socket.on('joinUser', (userId) => socket.join(userId));
  socket.on('joinTech', (techId) => socket.join(techId));
  socket.on('joinDispute', (disputeId) => socket.join(`dispute-${disputeId}`));

  // Real-time chat
  socket.on('joinChat', (chatId) => socket.join(chatId));
  socket.on('sendMessage', async (data) => {
    const { chatId, message, senderId } = data;
    // Save to Chat model (in controller)
    io.to(chatId).emit('newMessage', { chatId, message, senderId });
  });
  socket.on('sendDisputeMessage', async (data) => {
    const { disputeId, message, senderId } = data;
    const Dispute = require('./models/Dispute');
    await Dispute.addMessage(disputeId, senderId, message);
    io.to(`dispute-${disputeId}`).emit('newMessage', { message, senderId });
  });

  // OTP feedback
  socket.on('otpSent', (data) => {
    socket.emit('otpFeedback', { success: true, ...data });
  });

  // Live location updates from technicians
  socket.on('shareLocation', async ({ jobId, lat, lng }) => {
    try {
      const Job = require('./models/Job');
      const job = await Job.findById(jobId).select('userId techId').populate('techId', 'location');
      if (!job) return;
      // Forward location update to the user room and job room
      const payload = { jobId, lat, lng, at: Date.now() };
      io.to(job.userId.toString()).emit('locationUpdate', payload);
      io.to(jobId.toString()).emit('locationUpdate', payload);
    } catch (e) {
      console.error('shareLocation error:', e.message);
    }
  });

  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

// Attach io to req for controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// WebRTC signaling (simple peer-to-peer setup)
app.post('/api/webrtc/signal', (req, res) => {
  const { roomId, signal } = req.body;
  io.to(roomId).emit('signal', signal);
  res.json({ success: true });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ msg: 'Internal Server Error', error: err.message });
});

// Database and Redis setup
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('MongoDB connected');
  // Skip Redis connection errors for demo purposes
  try {
    startWorkers();
  } catch (error) {
    console.log('Worker initialization skipped for demo');
  }
})
  .catch(err => console.error('MongoDB connection error:', err));

// Email workers disabled for demo

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`FixItNow server running on port ${PORT}`));

// nodemon: trigger restart after CLIENT_URLS change