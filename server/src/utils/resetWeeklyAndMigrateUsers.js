const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const User = require('../models/User');
const Post = require('../models/Post');
const { extractLinkedInUsername, canonicalizeLinkedInUrl } = require('../services/apifyScraper');
const { getCurrentWeekId } = require('./weekUtils');

async function resetWeeklyAndMigrateUsers() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clouddevopshub_leaderboard';
  console.log(`🔌 Connecting to MongoDB: ${mongoUri.replace(/:\/\/[^@]+@/, '://***@')} ...`);

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB.');

    const currentWeekId = getCurrentWeekId();
    console.log(`📅 Current ISO Week ID: ${currentWeekId}`);

    const allUsers = await User.find();
    console.log(`📊 Total users in MongoDB: ${allUsers.length}`);

    // 1. Group users by canonical linkedinUsername to find duplicates
    const usersByUsername = new Map();

    for (const user of allUsers) {
      const canonicalUsername = extractLinkedInUsername(user.linkedinUrl);
      if (!usersByUsername.has(canonicalUsername)) {
        usersByUsername.set(canonicalUsername, []);
      }
      usersByUsername.get(canonicalUsername).push(user);
    }

    // 2. Resolve duplicates (e.g. "aaa" vs real name on same profile)
    for (const [username, userList] of usersByUsername.entries()) {
      if (userList.length > 1) {
        console.log(`⚠️ Found ${userList.length} duplicate users for handle "${username}":`);
        userList.forEach((u) => console.log(`   - ID: ${u._id}, Name: "${u.name}", Points: ${u.totalPoints}, URL: ${u.linkedinUrl}`));

        // Sort descending by points, or prefer non-junk names (e.g. not "aaa")
        userList.sort((a, b) => {
          const aIsJunk = a.name.toLowerCase() === 'aaa' || a.name.length <= 3;
          const bIsJunk = b.name.toLowerCase() === 'aaa' || b.name.length <= 3;
          if (aIsJunk && !bIsJunk) return 1;
          if (!aIsJunk && bIsJunk) return -1;
          return b.totalPoints - a.totalPoints;
        });

        const primaryUser = userList[0];
        const duplicates = userList.slice(1);

        console.log(`   🏆 Keeping primary user: "${primaryUser.name}" (${primaryUser._id})`);

        for (const dup of duplicates) {
          console.log(`   🗑️ Deleting duplicate user: "${dup.name}" (${dup._id})`);
          // Reassign posts to primary user if needed
          await Post.updateMany({ userId: dup._id }, { userId: primaryUser._id, userLinkedinUrl: primaryUser.linkedinUrl });
          await User.findByIdAndDelete(dup._id);
        }
      }
    }

    // 3. Migrate and clean all active users
    const remainingUsers = await User.find();
    console.log(`\n🔄 Updating ${remainingUsers.length} active users:`);

    for (const user of remainingUsers) {
      const canonicalUsername = extractLinkedInUsername(user.linkedinUrl);
      const canonicalUrl = canonicalizeLinkedInUrl(user.linkedinUrl);

      user.linkedinUsername = canonicalUsername;
      user.linkedinUrl = canonicalUrl;

      // Clean weekly reset: set weekly points to 0 for the fresh week
      user.currentWeekId = currentWeekId;
      user.weeklyPoints = 0;
      user.weeklyVerifiedPostsCount = 0;
      user.weeklyRank = 0;
      user.lastWeeklySubmissionAt = null; // Ready for a fresh submission this week!

      await user.save();
      console.log(`  ✅ ${user.name} | Handle: ${user.linkedinUsername} | Total Pts: ${user.totalPoints} | Weekly Pts: 0`);
    }

    // 4. Recalculate all-time ranks
    const finalUsers = await User.find().sort({ totalPoints: -1, verifiedPostsCount: -1 });
    for (let i = 0; i < finalUsers.length; i++) {
      finalUsers[i].rank = i + 1;
      await finalUsers[i].save();
    }

    console.log('\n🎉 Weekly reset & migration complete! All weekly scores reset to 0, canonical handles indexed, duplicates resolved.');
  } catch (err) {
    console.error('❌ Error during weekly reset and migration:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

resetWeeklyAndMigrateUsers();
