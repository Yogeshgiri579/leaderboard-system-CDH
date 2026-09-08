const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const User = require('../models/User');
const Post = require('../models/Post');

async function cleanDummyData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Find dummy users: users whose linkedinUrl is one of the initial seed URLs
    const dummyLinkedinUrls = [
      'https://www.linkedin.com/in/aarav-sharma-devops',
      'https://www.linkedin.com/in/priya-patel-cloud',
      'https://www.linkedin.com/in/rohan-verma-infra',
      'https://www.linkedin.com/in/sneha-kulkarni-sre',
      'https://www.linkedin.com/in/vikram-mehta-dev',
      'https://www.linkedin.com/in/ananya-gupta-cloudops',
    ];

    const dummyUsers = await User.find({ linkedinUrl: { $in: dummyLinkedinUrls } });
    const dummyUserIds = dummyUsers.map(u => u._id);

    // Delete posts of dummy users
    const deletedPosts = await Post.deleteMany({
      $or: [
        { userId: { $in: dummyUserIds } },
        { userLinkedinUrl: { $in: dummyLinkedinUrls } }
      ]
    });
    console.log(`Deleted ${deletedPosts.deletedCount} dummy posts.`);

    // Delete dummy users
    const deletedUsers = await User.deleteMany({ linkedinUrl: { $in: dummyLinkedinUrls } });
    console.log(`Deleted ${deletedUsers.deletedCount} dummy users.`);

    // Recalculate rank for all remaining users
    const remainingUsers = await User.find().sort({ totalPoints: -1, verifiedPostsCount: -1 });
    for (let i = 0; i < remainingUsers.length; i++) {
      remainingUsers[i].rank = i + 1;
      await remainingUsers[i].save();
    }

    console.log('\nRemaining real users in MongoDB:');
    const finalUsers = await User.find();
    finalUsers.forEach(u => console.log(`- #${u.rank} ${u.name} (${u.linkedinUrl}) | Points: ${u.totalPoints}`));

    const finalPostsCount = await Post.countDocuments();
    console.log(`Total real posts in MongoDB: ${finalPostsCount}`);

    await mongoose.disconnect();
    console.log('Done.');
  } catch (err) {
    console.error('Error cleaning dummy data:', err);
  }
}

cleanDummyData();
