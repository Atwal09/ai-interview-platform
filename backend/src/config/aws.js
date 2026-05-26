'use strict';

const AWS = require('aws-sdk');
const logger = require('./logger');

const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

// Only configure if credentials are provided
if (awsConfig.accessKeyId && awsConfig.secretAccessKey) {
  AWS.config.update(awsConfig);
  logger.info('AWS SDK configured', { region: awsConfig.region });
} else {
  logger.warn('AWS credentials not set — S3/SES features will use fallback mocks');
}

/**
 * S3 client instance
 */
const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: { Bucket: process.env.AWS_S3_BUCKET },
});

/**
 * SES client instance
 */
const ses = new AWS.SES({
  apiVersion: '2010-12-01',
  region: process.env.AWS_REGION || 'us-east-1',
});

module.exports = { s3, ses, AWS };
