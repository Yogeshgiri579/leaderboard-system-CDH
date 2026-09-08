const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const User = require('../models/User');
const Post = require('../models/Post');
const { evaluateBatch45Badges } = require('../services/pointsEngine');
const { inMemoryUsers, inMemoryPosts } = require('./seedData');

async function updateExistingUsers() {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clouddevopshub_leaderboard';

  try {
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 4000 });
    console.log('✅ Connected to MongoDB');

    // Find all users or specifically Ravi, Avinash, Yogesh
    const users = await User.find({
      $or: [
        { name: /ravi/i },
        { name: /avinash/i },
        { name: /yogesh/i },
        { batch: /alpha/i },
      ],
    });

    console.log(`Found ${users.length} users in MongoDB to update:`);

    for (const user of users) {
      console.log(`\nProcessing user: ${user.name} (Current Batch: ${user.batch})`);

      // 1. Update batch to Batch 44
      user.batch = 'Batch 44';

      // 2. Fetch their posts
      const posts = await Post.find({ userId: user._id });
      console.log(`  Found ${posts.length} posts for ${user.name}`);

      const verifiedPosts = posts.filter((p) => p.isRelevant);
      console.log(`  Verified posts: ${verifiedPosts.length}`);

      // 3. Evaluate 10-module curriculum badges based on their posts
      const badgeEval = evaluateBatch45Badges(verifiedPosts, user.tags || []);

      // If they don't have enough posts to unlock a badge, ensure their posts have keywords or unlock appropriate ones
      user.unlockedBadges = badgeEval.unlockedBadges;

      // If user has verified posts, let's also tag the posts with matched module IDs
      for (const p of posts) {
        if (p.isRelevant) {
          const { classifyPostModules } = require('../services/aiAnalyzer');
          p.matchedModuleIds = classifyPostModules(p.postText, p.detectedKeywords || []);
          await p.save();
        }
      }

      // Re-evaluate with updated post module IDs
      const reEval = evaluateBatch45Badges(verifiedPosts, user.tags || []);
      user.unlockedBadges = reEval.unlockedBadges;

      await user.save();
      console.log(`  ✅ Updated ${user.name} -> Batch: ${user.batch}, Unlocked Badges: ${user.unlockedBadges.length}/10`);
      user.unlockedBadges.forEach((b) => console.log(`     - [${b.code}] ${b.title} ${b.subtitle}`));
    }

    // Recalculate ranks
    const allUsers = await User.find().sort({ totalPoints: -1, verifiedPostsCount: -1 });
    for (let i = 0; i < allUsers.length; i++) {
      allUsers[i].rank = i + 1;
      await allUsers[i].save();
    }

    console.log('\n✅ All existing users in MongoDB updated successfully!');
  } catch (err) {
    console.error('MongoDB error or not running:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

updateExistingUsers();
