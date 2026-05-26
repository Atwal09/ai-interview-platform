const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { authenticate } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { resumeUpload } = require('../middleware/upload');

router.use(authenticate);

router.post('/upload', uploadLimiter, resumeUpload.single('resume'), resumeController.uploadResume);
router.get('/', resumeController.getResumes);
router.get('/:id', resumeController.getResume);
router.get('/:id/analysis', resumeController.getResumeAnalysis);
router.delete('/:id', resumeController.deleteResume);

module.exports = router;
