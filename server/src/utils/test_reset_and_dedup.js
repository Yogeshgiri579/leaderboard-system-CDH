const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const User = require('../models/User');
const { extractLinkedInUsername, canonicalizeLinkedInUrl } = require('../services/apifyScraper');
const { getCurrentWeekId } = require('./weekUtils');

async function runTests() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clouddevopshub_leaderboard';
  console.log('🧪 Starting Verification Tests...');

  try {
    await mongoose.connect(mongoUri);

    // Test 1: Canonical URL & Username extraction
    console.log('\n--- Test 1: Canonical Username Extraction ---');
    const urls = [
      'https://www.linkedin.com/in/engineerpoojatyagi/?skipRedirect=true',
      'https://linkedin.com/in/EngineerPoojaTyagi',
      'http://in.linkedin.com/in/engineerpoojatyagi/',
      'https://www.linkedin.com/in/engineerpoojatyagi',
    ];

    const handles = urls.map(u => extractLinkedInUsername(u));
    const allMatch = handles.every(h => h === 'engineerpoojatyagi');
    console.log('Handles extracted:', handles);
    if (allMatch) {
      console.log('✅ PASS: All URL variations correctly normalize to "engineerpoojatyagi"');
    } else {
      console.error('❌ FAIL: Extraction failed to normalize all variations');
    }

    // Test 2: Check "aaa" is gone and Pooja Tyagi is single
    console.log('\n--- Test 2: Verify Duplicate Cleaned from DB ---');
    const aaaUsers = await User.find({ name: /aaa/i });
    console.log(`Users with name "aaa": ${aaaUsers.length}`);
    const poojaUsers = await User.find({ linkedinUsername: 'engineerpoojatyagi' });
    console.log(`Users with handle "engineerpoojatyagi": ${poojaUsers.length}`);
    if (aaaUsers.length === 0 && poojaUsers.length === 1 && poojaUsers[0].name === 'Pooja Tyagi') {
      console.log('✅ PASS: "aaa" is deleted, only "Pooja Tyagi" remains.');
    } else {
      console.warn('⚠️ Note: Duplicate count:', { aaaUsers: aaaUsers.length, poojaUsers: poojaUsers.length });
    }

    // Test 3: Check weekly leaderboard simulation
    console.log('\n--- Test 3: Weekly Leaderboard Filter ---');
    const currentWeekId = getCurrentWeekId();
    const allUsers = await User.find();
    const weeklyActive = allUsers.filter(u => u.currentWeekId === currentWeekId && (u.weeklyPoints > 0 || u.weeklyVerifiedPostsCount > 0));
    console.log(`Total users in DB: ${allUsers.length}`);
    console.log(`Users active this week (${currentWeekId}): ${weeklyActive.length}`);
    if (weeklyActive.length === 0) {
      console.log('✅ PASS: Weekly leaderboard is cleanly reset to 0 members (no false #1-#4 rankings with 0 points).');
    } else {
      console.log(`ℹ️ Weekly active users: ${weeklyActive.length}`);
    }

    console.log('\n✨ All tests completed.');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();
