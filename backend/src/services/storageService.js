'use strict';

const { s3 } = require('../config/aws');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const logger = require('../config/logger');

const BUCKET = process.env.AWS_S3_BUCKET || 'workforme-space-uploads';
const CDN_URL = process.env.AWS_CLOUDFRONT_URL || null;

/**
 * Upload a file to S3
 * @param {object} file - File object { buffer, originalname, mimetype }
 * @param {string} folder - S3 folder prefix (e.g., 'resumes', 'audio')
 * @returns {Promise<object>} { url, key, bucket }
 */
async function uploadFile(file, folder = 'uploads') {
  if (!process.env.AWS_ACCESS_KEY_ID) {
    logger.warn('AWS not configured — returning mock URL for upload');
    const mockKey = `${folder}/${uuidv4()}-${file.originalname || 'file'}`;
    return {
      url: `https://mock-s3.local/${BUCKET}/${mockKey}`,
      key: mockKey,
      bucket: BUCKET,
      mock: true,
    };
  }

  const extension = path.extname(file.originalname || '.bin');
  const key = `${folder}/${uuidv4()}${extension}`;

  const params = {
    Bucket: BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    Metadata: {
      originalName: file.originalname || '',
      uploadedAt: new Date().toISOString(),
    },
  };

  try {
    const result = await s3.upload(params).promise();
    const url = CDN_URL ? `${CDN_URL}/${key}` : result.Location;

    logger.info('File uploaded to S3', { key, bucket: BUCKET, size: file.size });

    return { url, key, bucket: BUCKET, etag: result.ETag };
  } catch (err) {
    logger.error('S3 upload failed', { error: err.message, key });
    throw new Error(`S3 upload failed: ${err.message}`);
  }
}

/**
 * Delete a file from S3
 * @param {string} key - S3 object key
 * @returns {Promise<boolean>}
 */
async function deleteFile(key) {
  if (!process.env.AWS_ACCESS_KEY_ID) {
    logger.warn('AWS not configured — skipping S3 delete', { key });
    return true;
  }

  try {
    await s3.deleteObject({ Bucket: BUCKET, Key: key }).promise();
    logger.info('File deleted from S3', { key });
    return true;
  } catch (err) {
    logger.error('S3 delete failed', { error: err.message, key });
    throw new Error(`S3 delete failed: ${err.message}`);
  }
}

/**
 * Generate a pre-signed URL for temporary private access
 * @param {string} key - S3 object key
 * @param {number} expiresIn - Expiry in seconds (default 1 hour)
 * @returns {Promise<string>} Pre-signed URL
 */
async function getSignedUrl(key, expiresIn = 3600) {
  if (!process.env.AWS_ACCESS_KEY_ID) {
    logger.warn('AWS not configured — returning mock signed URL');
    return `https://mock-s3.local/${BUCKET}/${key}?signed=true`;
  }

  try {
    const url = await s3.getSignedUrlPromise('getObject', {
      Bucket: BUCKET,
      Key: key,
      Expires: expiresIn,
    });
    return url;
  } catch (err) {
    logger.error('S3 getSignedUrl failed', { error: err.message, key });
    throw new Error(`Failed to generate signed URL: ${err.message}`);
  }
}

/**
 * List files in a folder
 * @param {string} prefix - S3 folder prefix
 * @returns {Promise<Array>}
 */
async function listFiles(prefix) {
  if (!process.env.AWS_ACCESS_KEY_ID) {
    return [];
  }

  try {
    const result = await s3.listObjectsV2({ Bucket: BUCKET, Prefix: prefix }).promise();
    return result.Contents || [];
  } catch (err) {
    logger.error('S3 listFiles failed', { error: err.message, prefix });
    return [];
  }
}

module.exports = { uploadFile, deleteFile, getSignedUrl, listFiles };
