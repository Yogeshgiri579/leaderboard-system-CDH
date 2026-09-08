const express = require('express');
const router = express.Router();
const { getLeaderboard, getCommunityStats } = require('../controllers/leaderboardController');

// Get ranked leaderboard
router.get('/', getLeaderboard);

// Get global community statistics
router.get('/stats', getCommunityStats);

module.exports = router;
