const axios = require('axios');

async function testSystem() {
  const API_URL = 'http://localhost:5000/api';

  console.log('🧪 1. Testing GET /api/users/badges/catalog...');
  try {
    const catalogRes = await axios.get(`${API_URL}/users/badges/catalog`);
    console.log(`✅ Badges Catalog received: ${catalogRes.data.modules.length} Batch 45 modules loaded.`);
    catalogRes.data.modules.forEach(m => console.log(`   - ${m.code}: ${m.title} ${m.subtitle} (${m.color})`));
  } catch (err) {
    console.error('❌ Failed catalog test:', err.message);
    return;
  }

  console.log('\n🧪 2. Testing POST /api/users/submit (Job Queue Submission)...');
  let jobId = null;
  try {
    const submitRes = await axios.post(`${API_URL}/users/submit`, {
      name: 'Batch 45 Engineer',
      linkedinUrl: 'https://www.linkedin.com/in/batch45-devops-pro',
      batch: 'Batch 45 - Multi-Cloud & DevOps With AI',
    });
    console.log(`✅ Enqueue Success! Job ID: ${submitRes.data.jobId}, Queued: ${submitRes.data.queued}`);
    jobId = submitRes.data.jobId;
  } catch (err) {
    console.error('❌ Failed submit test:', err.response?.data || err.message);
    return;
  }

  console.log('\n🧪 3. Polling Job Status...');
  let attempts = 0;
  while (attempts < 20) {
    attempts++;
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const statusRes = await axios.get(`${API_URL}/users/job-status/${jobId}`);
      const job = statusRes.data;
      console.log(`   [Attempt ${attempts}] Status: ${job.status}, Stage: ${job.stage}, Progress: ${job.progress}% - ${job.message}`);

      if (job.status === 'completed' || job.stage === 'completed') {
        console.log('\n🎉 Job Completed Successfully!');
        const result = job.result;
        console.log(`   👤 User: ${result.user.name}`);
        console.log(`   📊 Total Points: ${result.user.totalPoints} pts`);
        console.log(`   📝 Verified Posts: ${result.user.verifiedPostsCount}`);
        console.log(`   🏅 Unlocked Badges: ${result.unlockedCount} / 10`);
        result.unlockedBadges.forEach((ub) => {
          console.log(`      ✓ [${ub.code}] ${ub.title} ${ub.subtitle} (Color: ${ub.color})`);
        });
        break;
      } else if (job.status === 'failed') {
        console.error('❌ Job Failed:', job.error);
        break;
      }
    } catch (err) {
      console.error('❌ Polling Error:', err.message);
    }
  }

  console.log('\n🧪 4. Testing Leaderboard Retrieval...');
  try {
    const lbRes = await axios.get(`${API_URL}/leaderboard`);
    console.log(`✅ Leaderboard count: ${lbRes.data.count} members.`);
    if (lbRes.data.users.length > 0) {
      const top = lbRes.data.users[0];
      console.log(`   🥇 Top Rank: ${top.name} - ${top.totalPoints} pts (${top.unlockedBadges?.length || 0} badges)`);
    }
  } catch (err) {
    console.error('❌ Leaderboard error:', err.message);
  }
}

testSystem();
