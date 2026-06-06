// backend/src/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Import routes (will be created later)
// const authRoutes = require('./routes/auth');
// const adminRoutes = require('./routes/admin');
// const studentRoutes = require('./routes/students');
const mentorRoutes = require('./routes/mentors');
// const courseRoutes = require('./routes/courses');
// const enrollmentRoutes = require('./routes/enrollments');
// const imageRoutes = require('./routes/images');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Connect to DB
connectDB();

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', timestamp: Date.now() });
});

// API routes (prefix /api/v1)
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/admin', adminRoutes);
// app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/mentors', mentorRoutes);
// app.use('/api/v1/courses', courseRoutes);
// app.use('/api/v1/enrollments', enrollmentRoutes);
// app.use('/api/v1/images', imageRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
