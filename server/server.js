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

// ALLOWED_ORIGIN: set this in Vercel environment variables to your
// production frontend URL e.g. https://mini-ats.vercel.app
// Falls back to localhost for local development.
const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    // Allow any *.vercel.app domain (covers preview deployments)
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
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
