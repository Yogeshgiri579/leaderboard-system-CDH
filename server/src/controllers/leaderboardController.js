const User = require('../models/User');
const Post = require('../models/Post');
const { getDBStatus } = require('../config/db');
const { inMemoryUsers, inMemoryPosts } = require('../utils/seedData');
const { getCurrentWeekId, getWeekDateRange } = require('../utils/weekUtils');

/**
 * Get Ranked Leaderboard with search, batch filter, and weekly/all-time timeframe
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const { batch, search, timeframe = 'weekly' } = req.query;
    const isDB = getDBStatus();
    const currentWeekId = getCurrentWeekId();
    const weekInfo = getWeekDateRange(currentWeekId);

    let users = [];

    if (isDB) {
      const query = {};
      if (batch && batch !== 'All') {
        const cleanBatch = batch.replace(/\s*\(.*?\)/, '').trim();
        query.batch = new RegExp(cleanBatch, 'i');
      }
      if (search && search.trim() !== '') {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [{ name: searchRegex }, { linkedinUrl: searchRegex }, { batch: searchRegex }];
      }

      const rawUsers = await User.find(query);
      const normalized = rawUsers.map((u) => {
        const obj = u.toObject ? u.toObject() : { ...u };
        // If user hasn't submitted yet for current week cycle, weekly score is 0
        if (obj.currentWeekId !== currentWeekId) {
          obj.weeklyPoints = 0;
          obj.weeklyVerifiedPostsCount = 0;
        }
        return obj;
      });

      if (timeframe === 'all-time') {
        normalized.sort((a, b) => b.totalPoints - a.totalPoints || b.verifiedPostsCount - a.verifiedPostsCount);
        normalized.forEach((u, i) => { u.rank = i + 1; });
      } else {
        // Weekly ranking
        normalized.sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0) || b.totalPoints - a.totalPoints);
        normalized.forEach((u, i) => { u.rank = i + 1; u.weeklyRank = i + 1; });
      }

      users = normalized;
    } else {
      let filtered = inMemoryUsers.map((u) => {
        const obj = { ...u };
        if (obj.currentWeekId !== currentWeekId) {
          obj.weeklyPoints = 0;
          obj.weeklyVerifiedPostsCount = 0;
        }
        return obj;
      });

      if (batch && batch !== 'All') {
        const cleanBatch = batch.replace(/\s*\(.*?\)/, '').trim().toLowerCase();
        filtered = filtered.filter((u) => (u.batch || '').toLowerCase().includes(cleanBatch));
      }

      if (search && search.trim() !== '') {
        const term = search.trim().toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.name.toLowerCase().includes(term) ||
            u.linkedinUrl.toLowerCase().includes(term) ||
            (u.batch && u.batch.toLowerCase().includes(term))
        );
      }

      if (timeframe === 'all-time') {
        filtered.sort((a, b) => b.totalPoints - a.totalPoints || b.verifiedPostsCount - a.verifiedPostsCount);
        filtered.forEach((u, i) => { u.rank = i + 1; });
      } else {
        filtered.sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0) || b.totalPoints - a.totalPoints);
        filtered.forEach((u, i) => { u.rank = i + 1; u.weeklyRank = i + 1; });
      }

      users = filtered;
    }

    return res.status(200).json({
      success: true,
      timeframe: timeframe === 'all-time' ? 'all-time' : 'weekly',
      week: weekInfo,
      count: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve leaderboard.',
      error: error.message,
    });
  }
};

/**
 * Get Global Community Statistics (including weekly stats)
 */
exports.getCommunityStats = async (req, res) => {
  try {
    const isDB = getDBStatus();
    const currentWeekId = getCurrentWeekId();
    const weekInfo = getWeekDateRange(currentWeekId);

    let totalMembers = 0;
    let totalVerifiedPosts = 0;
    let totalPointsAwarded = 0;
    let totalModuleExperts = 0;
    let weeklyPointsAwarded = 0;
    let weeklyVerifiedPosts = 0;
    let activeMembersThisWeek = 0;
    let batches = [];

    if (isDB) {
      totalMembers = await User.countDocuments();
      const users = await User.find();
      totalVerifiedPosts = users.reduce((acc, curr) => acc + (curr.verifiedPostsCount || 0), 0);
      totalPointsAwarded = users.reduce((acc, curr) => acc + (curr.totalPoints || 0), 0);
      totalModuleExperts = await User.countDocuments({ isModuleExpert: true });
      batches = await User.distinct('batch');

      users.forEach((u) => {
        if (u.currentWeekId === currentWeekId) {
          weeklyPointsAwarded += u.weeklyPoints || 0;
          weeklyVerifiedPosts += u.weeklyVerifiedPostsCount || 0;
          if (u.lastWeeklySubmissionAt) activeMembersThisWeek++;
        }
      });
    } else {
      totalMembers = inMemoryUsers.length;
      totalVerifiedPosts = inMemoryUsers.reduce((acc, curr) => acc + (curr.verifiedPostsCount || 0), 0);
      totalPointsAwarded = inMemoryUsers.reduce((acc, curr) => acc + (curr.totalPoints || 0), 0);
      totalModuleExperts = inMemoryUsers.filter((u) => u.isModuleExpert).length;
      batches = Array.from(new Set(inMemoryUsers.map((u) => u.batch)));

      inMemoryUsers.forEach((u) => {
        if (u.currentWeekId === currentWeekId) {
          weeklyPointsAwarded += u.weeklyPoints || 0;
          weeklyVerifiedPosts += u.weeklyVerifiedPostsCount || 0;
          if (u.lastWeeklySubmissionAt) activeMembersThisWeek++;
        }
      });
    }

    return res.status(200).json({
      success: true,
      week: weekInfo,
      stats: {
        totalMembers,
        totalVerifiedPosts,
        totalPointsAwarded,
        totalModuleExperts,
        weeklyPointsAwarded,
        weeklyVerifiedPosts,
        activeMembersThisWeek,
        batches: ['All', ...batches],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve stats.',
      error: error.message,
    });
  }
};
