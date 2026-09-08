const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userLinkedinUrl: {
      type: String,
      required: true,
      index: true,
    },
    postUrl: {
      type: String,
      default: '',
    },
    postText: {
      type: String,
      default: '',
    },
    postedAt: {
      type: Date,
      default: Date.now,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    isRelevant: {
      type: Boolean,
      default: false,
    },
    mentionsVikasRatnawat: {
      type: Boolean,
      default: false,
    },
    aiRelevanceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    aiReasoning: {
      type: String,
      default: '',
    },
    detectedKeywords: [
      {
        type: String,
      },
    ],
    pointsAwarded: {
      type: Number,
      default: 0,
    },
    matchedModuleIds: [
      {
        type: String,
      },
    ],
    weekId: {
      type: String,
      default: '',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ userId: 1, isRelevant: 1 });

module.exports = mongoose.model('Post', postSchema);
