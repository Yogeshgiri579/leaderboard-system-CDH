const express = require('express');
const router = express.Router();
const {
  submitUserProfile,
  getUserPosts,
  checkJobStatus,
  getBadgesCatalog,
} = require('../controllers/userController');

// Submit or sync profile (asynchronous queue)
router.post('/submit', submitUserProfile);

// Check job status in background queue
router.get('/job-status/:jobId', checkJobStatus);

// Get official Batch 45 10-module badges catalog
router.get('/badges/catalog', getBadgesCatalog);

// Get posts and unlocked badges for a user
router.get('/:userId/posts', getUserPosts);

module.exports = router;

