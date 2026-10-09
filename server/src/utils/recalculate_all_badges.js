const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

const User = require('../models/User');
const Post = require('../models/Post');
const { classifyPostModules } = require('../services/aiAnalyzer');
const { evaluateBatch45Badges, evaluateModuleExpertStatus } = require('../services/pointsEngine');

async function recalculateAllBadges() {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error('No MONGODB_URI in .env');
    return;
  }

  try {
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB');

    const users = await User.find({});
    console.log(`Found ${users.length} total users to process.`);

    let updatedUsersCount = 0;

    for (const user of users) {
      const posts = await Post.find({ userId: user._id });
      
      // 1. Reclassify all posts using strict word boundary and module rules
      for (const p of posts) {
        const strictModules = classifyPostModules(p.postText, p.detectedKeywords || []);
        p.matchedModuleIds = strictModules;
        if (!p.aiVerdict) {
          p.aiVerdict = p.isRelevant ? 'VERIFIED' : 'REJECTED';
        }
        await p.save();
      }

      // 2. Filter verified posts
      const verifiedPosts = posts.filter((p) => p.isRelevant);

      // 3. Re-evaluate 10-module curriculum badges
      const badgeEval = evaluateBatch45Badges(verifiedPosts, user.tags || []);
      const prevBadgeCount = user.unlockedBadges ? user.unlockedBadges.length : 0;
      user.unlockedBadges = badgeEval.unlockedBadges;

      // 4. Re-evaluate expert badge status
      const expertStatus = evaluateModuleExpertStatus(
        user.verifiedPostsCount || verifiedPosts.length,
        user.totalPoints || 0,
        user.tags || []
      );
      user.isModuleExpert = expertStatus.isModuleExpert;
      user.moduleExpertBadge = expertStatus.moduleExpertBadge;

      await user.save();
      updatedUsersCount++;

      if (['Prayash Kumar Singh', 'Nikhil Kumar', 'Himanshu Shekhar', 'Aparna Udawant'].some(n => user.name.toLowerCase().includes(n.toLowerCase()))) {
        console.log(`\n📌 [${user.name}] (${user.batch})`);
        console.log(`   Verified Posts: ${verifiedPosts.length} | Points: ${user.totalPoints}`);
        console.log(`   Badges: ${prevBadgeCount} -> ${user.unlockedBadges.length}/10 Unlocked`);
        user.unlockedBadges.forEach(b => {
          console.log(`     - [${b.code}] ${b.title} ${b.subtitle}`);
        });
      }
    }

    // 5. Recalculate all-time ranks
    const sortedUsers = await User.find({}).sort({ totalPoints: -1, verifiedPostsCount: -1 });
    for (let i = 0; i < sortedUsers.length; i++) {
      sortedUsers[i].rank = i + 1;
      await sortedUsers[i].save();
    }

    console.log(`\n🎉 Successfully processed and updated all ${updatedUsersCount} users and their posts!`);
  } catch (err) {
    console.error('Error during recalculation:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

recalculateAllBadges();
