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
        users = normalized;
      } else {
        // Weekly ranking: ONLY include members who have submitted / synced their profile in the current week cycle!
        // If a member submitted this week, they ARE included even if their points are 0.
        // Members who did NOT submit this week are excluded.
        const weeklyUsers = normalized.filter((u) => u.currentWeekId === currentWeekId);
        weeklyUsers.sort(
          (a, b) =>
            (b.weeklyPoints || 0) - (a.weeklyPoints || 0) ||
            (b.weeklyVerifiedPostsCount || 0) - (a.weeklyVerifiedPostsCount || 0) ||
            (b.totalPoints || 0) - (a.totalPoints || 0)
        );
        weeklyUsers.forEach((u, i) => {
          u.rank = i + 1;
          u.weeklyRank = i + 1;
        });
        users = weeklyUsers;
      }
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
        users = filtered;
      } else {
        // Weekly ranking in-memory: only members who submitted this week
        const weeklyFiltered = filtered.filter((u) => u.currentWeekId === currentWeekId);
        weeklyFiltered.sort(
          (a, b) =>
            (b.weeklyPoints || 0) - (a.weeklyPoints || 0) ||
            (b.weeklyVerifiedPostsCount || 0) - (a.weeklyVerifiedPostsCount || 0) ||
            (b.totalPoints || 0) - (a.totalPoints || 0)
        );
        weeklyFiltered.forEach((u, i) => {
          u.rank = i + 1;
          u.weeklyRank = i + 1;
        });
        users = weeklyFiltered;
      }
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
    const { batch } = req.query;
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
      batches = await User.distinct('batch');
      const query = {};
      if (batch && batch !== 'All') {
        const cleanBatch = batch.replace(/\s*\(.*?\)/, '').trim();
        query.batch = new RegExp(cleanBatch, 'i');
      }

      totalMembers = await User.countDocuments(query);
      const users = await User.find(query);
      totalVerifiedPosts = users.reduce((acc, curr) => acc + (curr.verifiedPostsCount || 0), 0);
      totalPointsAwarded = users.reduce((acc, curr) => acc + (curr.totalPoints || 0), 0);
      totalModuleExperts = users.filter((u) => u.isModuleExpert).length;

      users.forEach((u) => {
        if (u.currentWeekId === currentWeekId) {
          weeklyPointsAwarded += u.weeklyPoints || 0;
          weeklyVerifiedPosts += u.weeklyVerifiedPostsCount || 0;
          if (u.lastWeeklySubmissionAt) activeMembersThisWeek++;
        }
      });
    } else {
      batches = Array.from(new Set(inMemoryUsers.map((u) => u.batch)));
      let filtered = [...inMemoryUsers];
      if (batch && batch !== 'All') {
        const cleanBatch = batch.replace(/\s*\(.*?\)/, '').trim().toLowerCase();
        filtered = filtered.filter((u) => (u.batch || '').toLowerCase().includes(cleanBatch));
      }

      totalMembers = filtered.length;
      totalVerifiedPosts = filtered.reduce((acc, curr) => acc + (curr.verifiedPostsCount || 0), 0);
      totalPointsAwarded = filtered.reduce((acc, curr) => acc + (curr.totalPoints || 0), 0);
      totalModuleExperts = filtered.filter((u) => u.isModuleExpert).length;

      filtered.forEach((u) => {
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
