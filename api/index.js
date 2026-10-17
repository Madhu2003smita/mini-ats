// Vercel serverless entry point — exports the Express app instead of calling listen()
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('../server/config/db');
const errorHandler = require('../server/middleware/errorHandler');

const candidateRoutes = require('../server/routes/candidates');
const jobRoutes = require('../server/routes/jobs');
const dashboardRoutes = require('../server/routes/dashboard');

// Connect to MongoDB (cached across warm invocations)
connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
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

// Export for Vercel — do NOT call app.listen()
module.exports = app;
