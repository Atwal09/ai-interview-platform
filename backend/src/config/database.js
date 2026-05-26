'use strict';

const mongoose = require('mongoose');
const logger = require('./logger');

const MONGODB_URI = process.env.MONGODB_URI;

// Use longer timeouts for Atlas free tier
const options = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 60000,
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 2,
  tls: true,
  tlsAllowInvalidCertificates: false,
};

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    await mongoose.connect(MONGODB_URI, options);
    isConnected = true;
    logger.info(`✅ MongoDB Atlas connected — db: ${mongoose.connection.name}`);
  } catch (err) {
    logger.error(`❌ MongoDB connection failed: ${err.message}`);
    throw err;
  }
}

async function disconnectDB() {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  logger.info('MongoDB disconnected');
}

// Connection event listeners
mongoose.connection.on('disconnected', () => {
  isConnected = false;
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  logger.info('MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB error: ${err.message}`);
});

module.exports = { connectDB, disconnectDB, mongoose };
