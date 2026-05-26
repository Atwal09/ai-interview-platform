'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const http = require('http');
const path = require('path');

const logger = require('./config/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const routes = require('./routes/index');
const { initSocket } = require('./services/socketService');
const { apiLimiter } = require('./middleware/rateLimiter');

require('./config/passport');

const PORT = parseInt(process.env.PORT, 10) || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const app = express();

// ─── Security & Core Middleware ───────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow curl/postman
    const isAllowed =
      allowedOrigins.includes(origin) ||
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /\.vercel\.app$/.test(origin) ||        // Vercel preview URLs
      /\.railway\.app$/.test(origin);          // Railway internal
    if (isAllowed) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }));
app.use(passport.initialize());

// ─── Rate Limiting ─────────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Uploads (local fallback) ─────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── API Routes ───────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'InterviewAI Backend API — workforme.space',
    version: '1.0.0',
    docs: '/api/docs',
  });
});

app.use('/api', routes);

// ─── Error Handlers ────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Connect to database, then start
const { connectDB } = require('./config/database');
connectDB()
  .then(() => {
    logger.info('MongoDB Atlas connected successfully');
  })
  .catch((err) => {
    logger.warn(`Database connection failed (API still available): ${err.message}`);
  });

server.listen(PORT, () => {
  logger.info(`🚀 InterviewAI Backend running on port ${PORT}`);
  logger.info(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`   Frontend: ${FRONTEND_URL}`);
  logger.info(`   API: http://localhost:${PORT}/api`);
  logger.info(`   Health: http://localhost:${PORT}/api/health`);
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
    logger.warn('⚠️  GEMINI_API_KEY not set — AI features will use fallback responses');
  }
});

server.on('error', (err) => {
  logger.error('Server error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => process.exit(0));
});

module.exports = app;
