const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    linkedinUrl: {
      type: String,
      required: [true, 'LinkedIn profile URL is required'],
      trim: true,
      unique: true,
    },
    batch: {
      type: String,
      required: [true, 'Batch identifier is required'],
      trim: true,
      default: 'Batch 1',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    verifiedPostsCount: {
      type: Number,
      default: 0,
    },
    totalPostsScraped: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      default: 0,
    },
    weeklyPoints: {
      type: Number,
      default: 0,
    },
    weeklyVerifiedPostsCount: {
      type: Number,
      default: 0,
    },
    weeklyRank: {
      type: Number,
      default: 0,
    },
    currentWeekId: {
      type: String,
      default: '',
    },
    lastWeeklySubmissionAt: {
      type: Date,
      default: null,
    },
    isModuleExpert: {
      type: Boolean,
      default: false,
    },
    moduleExpertBadge: {
      type: String,
      default: '',
    },
    lastScrapedAt: {
      type: Date,
      default: null,
    },
    bio: {
      type: String,
      default: '',
    },
    tags: [String],
    unlockedBadges: [
      {
        badgeId: { type: String, required: true },
        code: String,
        title: String,
        subtitle: String,
        color: String,
        unlockedAt: { type: Date, default: Date.now },
        evidencePostUrl: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for fast leaderboard retrieval
userSchema.index({ totalPoints: -1, verifiedPostsCount: -1 });
userSchema.index({ currentWeekId: 1, weeklyPoints: -1, weeklyVerifiedPostsCount: -1 });

module.exports = mongoose.model('User', userSchema);
