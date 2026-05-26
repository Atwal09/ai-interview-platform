'use strict';

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { UPLOAD_LIMITS } = require('../utils/constants');
const logger = require('../config/logger');

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Get storage engine based on environment
 */
function getStorage(folder) {
  if (isProduction && process.env.AWS_ACCESS_KEY_ID) {
    // Production: S3 storage via multer-s3
    const multerS3 = require('multer-s3');
    const { s3 } = require('../config/aws');

    return multerS3({
      s3,
      bucket: process.env.AWS_S3_BUCKET || 'workforme-space-uploads',
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname, uploadedBy: req.user?.id });
      },
      key: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const key = `${folder}/${uuidv4()}${ext}`;
        cb(null, key);
      },
    });
  }

  // Development: Local disk storage
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads', folder);
      const fs = require('fs');
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuidv4()}${ext}`);
    },
  });
}

/**
 * File filter for PDFs only (resumes)
 */
function pdfFilter(req, file, cb) {
  if (UPLOAD_LIMITS.ALLOWED_RESUME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', `Only PDF files are allowed. Got: ${file.mimetype}`));
  }
}

/**
 * File filter for audio files
 */
function audioFilter(req, file, cb) {
  if (UPLOAD_LIMITS.ALLOWED_AUDIO_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', `Only audio files are allowed. Got: ${file.mimetype}`));
  }
}

/**
 * File filter for images
 */
function imageFilter(req, file, cb) {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only image files are allowed'));
  }
}

/**
 * Resume upload middleware (PDF only, 10MB max)
 */
const resumeUpload = multer({
  storage: getStorage('resumes'),
  limits: { fileSize: UPLOAD_LIMITS.RESUME_MAX_SIZE, files: 1 },
  fileFilter: pdfFilter,
});

/**
 * Audio upload middleware (various audio formats, 50MB max)
 */
const audioUpload = multer({
  storage: getStorage('audio'),
  limits: { fileSize: UPLOAD_LIMITS.AUDIO_MAX_SIZE, files: 1 },
  fileFilter: audioFilter,
});

/**
 * Avatar upload middleware (image, 5MB max)
 */
const avatarUpload = multer({
  storage: getStorage('avatars'),
  limits: { fileSize: UPLOAD_LIMITS.AVATAR_MAX_SIZE, files: 1 },
  fileFilter: imageFilter,
});

/**
 * Memory storage upload (for processing before S3)
 */
const memoryStorage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD_LIMITS.RESUME_MAX_SIZE },
  fileFilter: pdfFilter,
});

module.exports = { resumeUpload, audioUpload, avatarUpload, memoryStorage };
