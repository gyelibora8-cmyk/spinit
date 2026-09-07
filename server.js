const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(cors());
app.use(express.json());

// Static files with caching
app.use(express.static('public', {
  maxAge: '1d', // Cache for 1 day
  etag: false
}));

// Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 second timeout
  res.setTimeout(30000);
  next();
});

// Connect DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.log('MongoDB Error', err.message);
    // Don't exit on connection error, allow graceful degradation
  });

// Cache headers middleware
const setCacheHeaders = (req, res, next) => {
  // Cache API responses for 5 minutes
  res.set('Cache-Control', 'public, max-age=300');
  next();
};

// Load routes safely - fixes the Object bug
function loadRoute(path, routePath) {
  try {
    const mod = require(routePath);
    const router = mod.router || mod.default || mod;
    if (typeof router === 'function' || (router && typeof router.stack !== 'undefined')) {
      app.use(path, router);
      console.log('Loaded ' + path);
    } else {
      console.log('Skipped ' + path + ' - not a router, got: ' + typeof router);
    }
  } catch (e) {
    console.log('Failed ' + path + ': ' + e.message);
  }
}

loadRoute('/api/auth', './routes/auth');
loadRoute('/api/games', './routes/games');
loadRoute('/api/codes', './routes/codes');
loadRoute('/api/payment', './routes/payment');
loadRoute('/api/user', './routes/user');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server is running',
    site: 'Spinit',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html', err => {
    if (err) res.json({ message: 'Spinit API running' });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log('Server running on ' + PORT));
