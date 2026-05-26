'use strict';

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

let io = null;

// Map of userId -> Set of socketIds
const userSockets = new Map();

/**
 * Initialize Socket.IO on the HTTP server
 * @param {http.Server} server - Node HTTP server
 * @returns {Server} io instance
 */
function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
  });

  // JWT Authentication middleware for sockets
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      logger.warn('Socket authentication failed', { error: err.message });
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    logger.info('Socket connected', { userId, socketId: socket.id });

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Track socket
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // If admin, join admin room
    if (socket.userRole === 'admin') {
      socket.join('admin');
    }

    // ── Event Handlers ────────────────────────────────────────────────────

    socket.on('interview:join', (interviewId) => {
      socket.join(`interview:${interviewId}`);
      logger.debug('User joined interview room', { userId, interviewId });
    });

    socket.on('interview:leave', (interviewId) => {
      socket.leave(`interview:${interviewId}`);
      logger.debug('User left interview room', { userId, interviewId });
    });

    socket.on('chat:message', (data) => {
      // Broadcast to user's room (handled by chatController response)
      socket.emit('chat:ack', { received: true, timestamp: Date.now() });
    });

    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    socket.on('disconnect', (reason) => {
      logger.info('Socket disconnected', { userId, socketId: socket.id, reason });

      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
    });

    socket.on('error', (err) => {
      logger.error('Socket error', { userId, error: err.message });
    });
  });

  logger.info('Socket.IO initialized');
  return io;
}

/**
 * Send a notification to a specific user
 * @param {string} userId - User ID
 * @param {object} notification - Notification payload
 */
function sendNotification(userId, notification) {
  if (!io) {
    logger.warn('Socket.IO not initialized');
    return;
  }

  io.to(`user:${userId}`).emit('notification:new', {
    ...notification,
    timestamp: Date.now(),
  });

  logger.debug('Notification sent via socket', { userId, type: notification.type });
}

/**
 * Emit interview update to all participants in interview room
 * @param {string} interviewId - Interview ID
 * @param {object} data - Update data
 */
function emitInterviewUpdate(interviewId, data) {
  if (!io) return;
  io.to(`interview:${interviewId}`).emit('interview:update', data);
}

/**
 * Emit analysis complete event to user
 * @param {string} userId - User ID
 * @param {object} analysisResult - Analysis result
 */
function emitAnalysisComplete(userId, analysisResult) {
  if (!io) return;
  io.to(`user:${userId}`).emit('analysis:complete', analysisResult);
}

/**
 * Broadcast to admin room
 * @param {string} event - Event name
 * @param {object} data - Event data
 */
function emitToAdmins(event, data) {
  if (!io) return;
  io.to('admin').emit(event, data);
}

/**
 * Check if a user is online
 * @param {string} userId - User ID
 * @returns {boolean}
 */
function isUserOnline(userId) {
  return userSockets.has(userId) && userSockets.get(userId).size > 0;
}

/**
 * Get the Socket.IO instance
 * @returns {Server|null}
 */
function getIO() {
  return io;
}

module.exports = {
  initSocket,
  sendNotification,
  emitInterviewUpdate,
  emitAnalysisComplete,
  emitToAdmins,
  isUserOnline,
  getIO,
};
