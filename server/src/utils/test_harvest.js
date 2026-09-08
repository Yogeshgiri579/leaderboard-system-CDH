const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { ApifyClient } = require('apify-client');

async function testHarvestApi() {
  const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
  try {
    console.log('Testing harvestapi/linkedin-profile-posts...');
    const run = await client.actor('harvestapi/linkedin-profile-posts').call({
      targetUrls: ['https://www.linkedin.com/in/yogesh-giri-6552b6224'],
      maxPosts: 5,
    }, {
      waitSecs: 30,
    });
    console.log('Run status:', run.status, 'dataset:', run.defaultDatasetId);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log('Items found:', items.length);
    if (items.length > 0) {
      console.log('Sample keys:', Object.keys(items[0]));
      console.log('Sample item:', items[0]);
    }
  } catch (err) {
    console.error('HarvestAPI Error:', err.message);
  }
}

testHarvestApi();
