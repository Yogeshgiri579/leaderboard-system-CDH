const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const User = require('../models/User');
const Post = require('../models/Post');
const { getDBStatus } = require('../config/db');
const { inMemoryUsers, inMemoryPosts } = require('../utils/seedData');
const { scrapeLinkedInPosts, extractLinkedInUsername, canonicalizeLinkedInUrl } = require('./apifyScraper');
const { analyzePostsBatchWithAI } = require('./aiAnalyzer');
const { calculatePostPoints, evaluateModuleExpertStatus, evaluateBatch45Badges } = require('./pointsEngine');
const { getCurrentWeekId, isDateInWeek } = require('../utils/weekUtils');

const REDIS_URL = process.env.REDIS_URL;
let redisConnection = null;
let profileQueue = null;
let profileWorker = null;

// In-Memory fallback jobs store & processing queue (used if Redis is not configured or in dev)
const inMemoryJobs = new Map();
const inMemoryQueue = [];
let isInMemoryProcessing = false;

/**
 * Core profile sync worker processor logic
 */
async function processProfileSync(jobData, updateProgress) {
  const { name, linkedinUrl, batch } = jobData;
  const cleanUsername = jobData.linkedinUsername || extractLinkedInUsername(linkedinUrl);
  const cleanUrl = canonicalizeLinkedInUrl(linkedinUrl);
  const cleanName = name.trim();
  const cleanBatch = (batch || 'Batch 45').trim();
  const currentWeekId = jobData.weekId || getCurrentWeekId();
  const isDB = getDBStatus();


  console.log(`🚀 [JobProcessor] Starting profile sync for: ${cleanName} (${cleanUrl}) [Week: ${currentWeekId}]`);
  await updateProgress('scraping', 20, 'Scraping up to 20 recent LinkedIn posts via Apify...');

  // 1. Scrape posts (up to 20)
  const rawPosts = await scrapeLinkedInPosts(cleanUrl, cleanName);

  await updateProgress('analyzing', 50, `Analyzing ${rawPosts.length} posts with AI batch inference...`);

  // 2. Batch AI Analysis (1 single turn for all 20 posts!)
  const analyzedResults = await analyzePostsBatchWithAI(rawPosts);

  await updateProgress('evaluating_badges', 75, 'Categorizing posts across 10 curriculum modules & evaluating badges...');

  let verifiedCount = 0;
  let totalPoints = 0;
  let weeklyVerifiedCount = 0;
  let weeklyPoints = 0;
  const allKeywords = new Set();
  const verifiedPostsList = [];

  const analyzedPostsData = rawPosts.map((raw, idx) => {
    const analysis = analyzedResults[idx] || {
      isRelevant: false,
      mentionsVikasRatnawat: false,
      aiRelevanceScore: 0,
      aiReasoning: 'Post not analyzed',
      detectedKeywords: [],
      matchedModuleIds: [],
    };

    const points = calculatePostPoints(analysis, raw.likesCount, raw.commentsCount);
    const postWeekId = raw.postedAt ? getCurrentWeekId(raw.postedAt) : currentWeekId;

    const postRecord = {
      postUrl: raw.postUrl,
      postText: raw.postText,
      postedAt: raw.postedAt,
      likesCount: raw.likesCount,
      commentsCount: raw.commentsCount,
      isRelevant: analysis.isRelevant,
      mentionsVikasRatnawat: analysis.mentionsVikasRatnawat,
      aiRelevanceScore: analysis.aiRelevanceScore,
      aiReasoning: analysis.aiReasoning,
      detectedKeywords: analysis.detectedKeywords || [],
      matchedModuleIds: analysis.matchedModuleIds || [],
      pointsAwarded: points,
      weekId: postWeekId,
    };

    if (postRecord.isRelevant) {
      verifiedCount++;
      totalPoints += points;
      verifiedPostsList.push(postRecord);

      // Check if post was published in the current week cycle
      if (postWeekId === currentWeekId || isDateInWeek(postRecord.postedAt, currentWeekId)) {
        weeklyVerifiedCount++;
        weeklyPoints += points;
      }
    }
    (postRecord.detectedKeywords || []).forEach((k) => allKeywords.add(k));

    return postRecord;
  });

  // 3. Evaluate 10-Module Badges & Expert Status
  const badgeEvaluation = evaluateBatch45Badges(verifiedPostsList, Array.from(allKeywords));
  const { isModuleExpert, moduleExpertBadge } = evaluateModuleExpertStatus(
    verifiedCount,
    totalPoints,
    Array.from(allKeywords)
  );

  await updateProgress('ranking', 90, 'Updating database and recalculating weekly cohort leaderboard ranks...');

  const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
    extractLinkedInUsername(cleanUrl)
  )}&backgroundColor=0284c7,059669,7c3aed`;

  let userRecord;
  let savedPosts = [];

  if (isDB) {
    let user = await User.findOne({
      $or: [
        { linkedinUsername: cleanUsername },
        { linkedinUrl: cleanUrl },
        { linkedinUrl: jobData.linkedinUrl },
      ],
    });
    if (user) {
      user.name = cleanName;
      user.batch = cleanBatch;
      user.linkedinUrl = cleanUrl;
      user.linkedinUsername = cleanUsername;
      user.verifiedPostsCount = verifiedCount;
      user.totalPostsScraped = rawPosts.length;
      user.totalPoints = totalPoints;
      user.weeklyPoints = weeklyPoints;
      user.weeklyVerifiedPostsCount = weeklyVerifiedCount;
      user.currentWeekId = currentWeekId;
      user.lastWeeklySubmissionAt = new Date();
      user.isModuleExpert = isModuleExpert;
      user.moduleExpertBadge = moduleExpertBadge;
      user.unlockedBadges = badgeEvaluation.unlockedBadges;
      user.lastScrapedAt = new Date();
      user.tags = Array.from(allKeywords);
      if (!user.avatarUrl) user.avatarUrl = avatarUrl;
      await user.save();
    } else {
      user = await User.create({
        name: cleanName,
        linkedinUrl: cleanUrl,
        linkedinUsername: cleanUsername,
        batch: cleanBatch,
        avatarUrl,
        verifiedPostsCount: verifiedCount,
        totalPostsScraped: rawPosts.length,
        totalPoints,
        weeklyPoints,
        weeklyVerifiedPostsCount: weeklyVerifiedCount,
        currentWeekId,
        lastWeeklySubmissionAt: new Date(),
        isModuleExpert,
        moduleExpertBadge,
        unlockedBadges: badgeEvaluation.unlockedBadges,
        lastScrapedAt: new Date(),
        tags: Array.from(allKeywords),
      });
    }

    // Refresh posts
    await Post.deleteMany({ userId: user._id });
    const postsToInsert = analyzedPostsData.map((p) => ({
      ...p,
      userId: user._id,
      userLinkedinUrl: cleanUrl,
    }));
    savedPosts = await Post.insertMany(postsToInsert);

    // Recalculate ranks across users:
    // 1. All-Time ranks
    const allUsers = await User.find().sort({ totalPoints: -1, verifiedPostsCount: -1 });
    for (let i = 0; i < allUsers.length; i++) {
      allUsers[i].rank = i + 1;
      await allUsers[i].save();
    }

    // 2. Weekly ranks for currentWeekId
    const weeklyUsers = await User.find({ currentWeekId }).sort({ weeklyPoints: -1, weeklyVerifiedPostsCount: -1 });
    for (let i = 0; i < weeklyUsers.length; i++) {
      weeklyUsers[i].weeklyRank = i + 1;
      await weeklyUsers[i].save();
    }

    userRecord = await User.findById(user._id);
  } else {
    // In-memory fallback
    let existingIndex = inMemoryUsers.findIndex(
      (u) =>
        (u.linkedinUsername && u.linkedinUsername === cleanUsername) ||
        u.linkedinUrl === cleanUrl ||
        u.linkedinUrl === jobData.linkedinUrl
    );
    const userId = existingIndex !== -1 ? inMemoryUsers[existingIndex]._id : `user_${Date.now()}`;

    const updatedUser = {
      _id: userId,
      name: cleanName,
      linkedinUrl: cleanUrl,
      linkedinUsername: cleanUsername,
      batch: cleanBatch,
      avatarUrl,
      verifiedPostsCount: verifiedCount,
      totalPostsScraped: rawPosts.length,
      totalPoints,
      weeklyPoints,
      weeklyVerifiedPostsCount: weeklyVerifiedCount,
      currentWeekId,
      lastWeeklySubmissionAt: new Date(),
      weeklyRank: 0,
      isModuleExpert,
      moduleExpertBadge,
      unlockedBadges: badgeEvaluation.unlockedBadges,
      lastScrapedAt: new Date(),
      tags: Array.from(allKeywords),
      createdAt: existingIndex !== -1 ? inMemoryUsers[existingIndex].createdAt : new Date(),
      updatedAt: new Date(),
    };

    if (existingIndex !== -1) {
      inMemoryUsers[existingIndex] = updatedUser;
    } else {
      inMemoryUsers.push(updatedUser);
    }

    inMemoryUsers.sort((a, b) => b.totalPoints - a.totalPoints);
    inMemoryUsers.forEach((u, i) => { u.rank = i + 1; });

    const currentWeekUsers = inMemoryUsers.filter((u) => u.currentWeekId === currentWeekId);
    currentWeekUsers.sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0));
    currentWeekUsers.forEach((u, i) => { u.weeklyRank = i + 1; });

    // Replace in-memory posts
    for (let i = inMemoryPosts.length - 1; i >= 0; i--) {
      if (inMemoryPosts[i].userLinkedinUrl === cleanUrl) {
        inMemoryPosts.splice(i, 1);
      }
    }

    analyzedPostsData.forEach((p, idx) => {
      const postObj = {
        ...p,
        _id: `post_${Date.now()}_${idx}`,
        userId,
        userLinkedinUrl: cleanUrl,
      };
      inMemoryPosts.push(postObj);
      savedPosts.push(postObj);
    });

    inMemoryUsers.sort((a, b) => b.totalPoints - a.totalPoints || b.verifiedPostsCount - a.verifiedPostsCount);
    inMemoryUsers.forEach((u, i) => {
      u.rank = i + 1;
    });
    userRecord = inMemoryUsers.find((u) => u.linkedinUrl === cleanUrl);
  }

  await updateProgress('completed', 100, 'Profile verified and badges updated!');

  return {
    user: userRecord,
    posts: savedPosts,
    badges: badgeEvaluation.allBadgesStatus,
    unlockedBadges: badgeEvaluation.unlockedBadges,
    unlockedCount: badgeEvaluation.unlockedCount,
  };
}

/**
 * Process in-memory queue jobs sequentially with safety concurrency
 */
async function processNextInMemoryJob() {
  if (isInMemoryProcessing || inMemoryQueue.length === 0) return;
  isInMemoryProcessing = true;

  const job = inMemoryQueue.shift();
  try {
    const updateProgress = async (stage, progress, message) => {
      job.stage = stage;
      job.progress = progress;
      job.message = message;
      job.updatedAt = new Date();
    };

    job.status = 'active';
    job.stage = 'started';
    job.progress = 10;
    job.message = 'Initializing background sync worker...';

    const result = await processProfileSync(job.data, updateProgress);
    job.status = 'completed';
    job.stage = 'completed';
    job.progress = 100;
    job.result = result;
    job.completedAt = new Date();
  } catch (err) {
    console.error(`❌ [JobProcessor] Job ${job.id} failed:`, err);
    job.status = 'failed';
    job.stage = 'failed';
    job.error = err.message;
  } finally {
    isInMemoryProcessing = false;
    // Process next if queued
    if (inMemoryQueue.length > 0) {
      setTimeout(processNextInMemoryJob, 100);
    }
  }
}

/**
 * Initialize BullMQ if REDIS_URL is provided, or prepare in-memory queue
 */
function initQueue() {
  if (REDIS_URL && REDIS_URL.trim() !== '') {
    try {
      console.log(`🔌 Connecting to Redis at ${REDIS_URL.replace(/:\/\/[^@]+@/, '://***@')}`);
      redisConnection = new IORedis(REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      });

      profileQueue = new Queue('profile-sync', { connection: redisConnection });

      profileWorker = new Worker(
        'profile-sync',
        async (job) => {
          const updateProgress = async (stage, progress, message) => {
            await job.updateProgress({ stage, progress, message });
          };
          return await processProfileSync(job.data, updateProgress);
        },
        {
          connection: redisConnection,
          concurrency: 5, // Process up to 5 concurrent profile analyses cleanly
        }
      );

      profileWorker.on('completed', (job) => {
        console.log(`✅ [BullMQ] Job ${job.id} completed successfully`);
      });

      profileWorker.on('failed', (job, err) => {
        console.error(`❌ [BullMQ] Job ${job?.id} failed:`, err.message);
      });

      console.log('⚡ BullMQ profile-sync queue active with Redis!');
    } catch (err) {
      console.warn(`⚠️ Failed to initialize Redis queue: ${err.message}. Using In-Memory queue fallback.`);
      profileQueue = null;
    }
  } else {
    console.log('ℹ️ No REDIS_URL provided. Using resilient In-Memory Job Queue with concurrency control.');
  }
}

// Auto-initialize queue on load
initQueue();

/**
 * Enqueue a profile sync task
 */
async function enqueueProfileSync(data) {
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (profileQueue) {
    const job = await profileQueue.add('syncUser', data, {
      jobId,
      removeOnComplete: { age: 3600 },
      removeOnFail: { age: 7200 },
    });
    return { jobId: job.id, isRedis: true };
  }

  // In-Memory Queue
  const jobRecord = {
    id: jobId,
    data,
    status: 'queued',
    stage: 'queued',
    progress: 5,
    message: 'Profile sync job queued in server...',
    result: null,
    error: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  inMemoryJobs.set(jobId, jobRecord);
  inMemoryQueue.push(jobRecord);
  processNextInMemoryJob();

  return { jobId, isRedis: false };
}

/**
 * Get status of a job
 */
async function getJobStatus(jobId) {
  if (profileQueue) {
    try {
      const job = await profileQueue.getJob(jobId);
      if (job) {
        const state = await job.getState();
        const progressData = job.progress || {};
        const isCompleted = state === 'completed';
        const isFailed = state === 'failed';

        return {
          jobId,
          status: state,
          stage: progressData.stage || (isCompleted ? 'completed' : state),
          progress: progressData.progress || (isCompleted ? 100 : 10),
          message: progressData.message || (isCompleted ? 'Sync complete!' : 'Processing...'),
          result: job.returnvalue || null,
          error: job.failedReason || null,
        };
      }
    } catch (err) {
      console.warn(`Error reading BullMQ job ${jobId}: ${err.message}`);
    }
  }

  // Check In-Memory jobs
  const job = inMemoryJobs.get(jobId);
  if (job) {
    return {
      jobId: job.id,
      status: job.status,
      stage: job.stage,
      progress: job.progress,
      message: job.message,
      result: job.result,
      error: job.error,
    };
  }

  return null;
}

module.exports = {
  enqueueProfileSync,
  getJobStatus,
  processProfileSync,
};
