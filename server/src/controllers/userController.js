const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const { getDBStatus } = require('../config/db');
const { inMemoryUsers, inMemoryPosts } = require('../utils/seedData');
const { BATCH_45_MODULES } = require('../config/badgeConfig');
const { enqueueProfileSync, getJobStatus, processProfileSync } = require('../services/queueService');
const { getCurrentWeekId, getWeekDateRange, isDateInWeek } = require('../utils/weekUtils');
const { extractLinkedInUsername, canonicalizeLinkedInUrl } = require('../services/apifyScraper');

/**
 * Submit or sync a user's LinkedIn profile via background job queue
 * Rules: Strict single identity and once-per-week submission.
 */
exports.submitUserProfile = async (req, res) => {
  try {
    const { name, linkedinUrl, batch } = req.body;

    if (!name || !linkedinUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both Name and LinkedIn Profile URL.',
      });
    }

    const cleanName = name.trim();
    const cleanBatch = (batch || 'Batch 44').trim();
    const cleanUsername = extractLinkedInUsername(linkedinUrl);

    if (!cleanUsername || cleanUsername.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/yourname).',
      });
    }

    const canonicalUrl = canonicalizeLinkedInUrl(linkedinUrl);
    const currentWeekId = getCurrentWeekId();
    const weekInfo = getWeekDateRange(currentWeekId);
    const isDB = getDBStatus();

    // 1. Check if this LinkedIn profile is already registered under a DIFFERENT name
    let existingUser = null;
    if (isDB) {
      existingUser = await User.findOne({
        $or: [
          { linkedinUsername: cleanUsername },
          { linkedinUrl: canonicalUrl },
          { linkedinUrl: linkedinUrl.trim().replace(/\/+$/, '') },
        ],
      });
    } else {
      existingUser = inMemoryUsers.find(
        (u) =>
          (u.linkedinUsername && u.linkedinUsername === cleanUsername) ||
          u.linkedinUrl === canonicalUrl ||
          u.linkedinUrl === linkedinUrl.trim().replace(/\/+$/, '')
      );
    }

    if (existingUser && existingUser.name && existingUser.name.toLowerCase() !== cleanName.toLowerCase()) {
      return res.status(400).json({
        success: false,
        duplicateProfile: true,
        message: `This LinkedIn profile is already registered under "${existingUser.name}". To prevent duplicate rankings, profiles cannot be submitted under multiple names.`,
      });
    }

    // 2. Check if this Name is already registered with a DIFFERENT LinkedIn profile
    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let existingNameUser = null;
    if (isDB) {
      existingNameUser = await User.findOne({
        name: new RegExp(`^${escapeRegex(cleanName)}$`, 'i'),
      });
    } else {
      existingNameUser = inMemoryUsers.find(
        (u) => u.name && u.name.toLowerCase() === cleanName.toLowerCase()
      );
    }

    if (existingNameUser) {
      const regUser = existingNameUser.linkedinUsername || extractLinkedInUsername(existingNameUser.linkedinUrl);
      if (regUser && regUser !== cleanUsername) {
        return res.status(400).json({
          success: false,
          duplicateName: true,
          message: `A member with the name "${cleanName}" is already registered with a different LinkedIn profile. Duplicate submissions are not permitted.`,
        });
      }
    }

    // 3. Strict weekly submission check: only once per week
    if (
      existingUser &&
      existingUser.currentWeekId === currentWeekId &&
      existingUser.lastWeeklySubmissionAt &&
      isDateInWeek(existingUser.lastWeeklySubmissionAt, currentWeekId)
    ) {
      return res.status(400).json({
        success: false,
        alreadySubmitted: true,
        weekId: currentWeekId,
        message: `You have already submitted your profile for this week (${currentWeekId}). Each member can submit strictly once per week. Your next submission window opens next Monday!`,
      });
    }

    console.log(`📥 Received submission request for: ${cleanName} (${canonicalUrl}) [Handle: ${cleanUsername}, Batch: ${cleanBatch}, Week: ${currentWeekId}]`);

    // Enqueue profile sync in Redis/In-Memory background queue
    const queueResult = await enqueueProfileSync({
      name: cleanName,
      linkedinUrl: canonicalUrl,
      linkedinUsername: cleanUsername,
      batch: cleanBatch,
      weekId: currentWeekId,
    });

    return res.status(202).json({
      success: true,
      queued: true,
      jobId: queueResult.jobId,
      message: 'Profile synchronization queued successfully!',
      statusUrl: `/api/users/job-status/${queueResult.jobId}`,
    });
  } catch (error) {
    console.error('Submission Queue Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to queue profile for sync.',
      error: error.message,
    });
  }
};

/**
 * Poll job status for a queued profile synchronization
 */
exports.checkJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const status = await getJobStatus(jobId);

    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'Job ID not found or already purged.',
      });
    }

    return res.status(200).json({
      success: true,
      ...status,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching job status.',
      error: error.message,
    });
  }
};

/**
 * Get the official 10-module catalog for CloudDevOpsHub Batch 45
 */
exports.getBadgesCatalog = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      batch: 'Batch 45 - Multi-Cloud & DevOps With AI',
      modules: BATCH_45_MODULES,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching badges catalog.',
      error: error.message,
    });
  }
};

/**
 * Get all analyzed posts and 10-module badges status for a specific user
 */
exports.getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const isDB = getDBStatus();

    let user;
    let posts = [];

    if (isDB) {
      if (mongoose.Types.ObjectId.isValid(userId)) {
        user = await User.findById(userId);
      }
      if (!user) {
        user = await User.findOne({ linkedinUrl: decodeURIComponent(userId) });
      }
      if (user) {
        posts = await Post.find({ userId: user._id }).sort({ isRelevant: -1, postedAt: -1 });
      }
    } else {
      user = inMemoryUsers.find((u) => u._id === userId || u.linkedinUrl === decodeURIComponent(userId));
      if (user) {
        posts = inMemoryPosts
          .filter((p) => p.userId === user._id || p.userLinkedinUrl === user.linkedinUrl)
          .sort((a, b) => (b.isRelevant ? 1 : 0) - (a.isRelevant ? 1 : 0));
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Evaluate full 10-module badges status
    const verifiedPosts = posts.filter((p) => p.isRelevant);
    const { evaluateBatch45Badges } = require('../services/pointsEngine');
    const badgeEvaluation = evaluateBatch45Badges(verifiedPosts, user.tags || []);

    return res.status(200).json({
      success: true,
      user,
      posts,
      badges: badgeEvaluation.allBadgesStatus,
      unlockedBadges: badgeEvaluation.unlockedBadges,
      unlockedCount: badgeEvaluation.unlockedCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching user posts',
      error: error.message,
    });
  }
};


