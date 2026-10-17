require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
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

// ── CORS ──────────────────────────────────────────────────────────────────────
// In production on Render the frontend and backend share the same origin, so
// CORS headers are never needed for browser requests. This config is kept as a
// safety net for local dev (Vite on :5173 calling Express on :5000) and any
// external API consumers.
const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.endsWith('.onrender.com')) return callback(null, true);
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/candidates', candidateRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Mini ATS API is running', timestamp: new Date() });
});

// ── Serve React build ─────────────────────────────────────────────────────────
// In production (NODE_ENV=production), Express serves the Vite build output.
// The static middleware is placed AFTER all /api routes so API calls are never
// intercepted by the file server.
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));

  // SPA fallback — any request that is not an /api route and not a static file
  // gets index.html so React Router can handle it client-side.
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  // Dev: 404 for unknown routes (Vite dev server handles the frontend)
  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
  });
}

app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
// Bind to 0.0.0.0 so Render's load balancer can reach the process.
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
