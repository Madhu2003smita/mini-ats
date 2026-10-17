require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Prevent nodemon / process from crashing on unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[UnhandledRejection]', err.message);
  // Do NOT exit — let the server keep running
});
process.on('uncaughtException', (err) => {
  console.error('[UncaughtException]', err.message);
});

// Route imports
const candidateRoutes = require('./routes/candidates');
const jobRoutes = require('./routes/jobs');
const dashboardRoutes = require('./routes/dashboard');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/candidates', candidateRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Mini ATS API is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
