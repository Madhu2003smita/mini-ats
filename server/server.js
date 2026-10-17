require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

process.on('unhandledRejection', (err) => {
  console.error('[UnhandledRejection]', err.message);
});
process.on('uncaughtException', (err) => {
  console.error('[UncaughtException]', err.message);
});

const candidateRoutes = require('./routes/candidates');
const jobRoutes = require('./routes/jobs');
const dashboardRoutes = require('./routes/dashboard');

connectDB();

const app = express();

// CLIENT_URL is injected by Vercel binding in production; falls back to localhost for dev
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/candidates', candidateRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Mini ATS API is running', timestamp: new Date() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

// Export for Vercel services runtime.
// When running locally with `node server.js`, start the HTTP server normally.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
