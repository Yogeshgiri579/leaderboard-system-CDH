const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const axios = require('axios');
const { ApifyClient } = require('apify-client');

async function testAll() {
  console.log('--- Testing Gemini 2.5 Flash ---');
  const geminiKey = process.env.GEMINI_API_KEY;
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        contents: [{ parts: [{ text: 'Respond with JSON: {"success": true, "message": "Gemini 2.5 Flash is working"}' }] }],
        generationConfig: { responseMimeType: 'application/json' },
      },
      { timeout: 10000 }
    );
    console.log('Gemini Result:', res.data?.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (e) {
    console.error('Gemini Error:', e.response?.status, e.response?.data || e.message);
  }

  console.log('\n--- Testing Apify Token & Actor ---');
  const apifyToken = process.env.APIFY_API_TOKEN;
  try {
    const client = new ApifyClient({ token: apifyToken });
    const user = await client.user().get();
    console.log('Apify User authenticated:', user.username || user.id);
    
    // Check actor info
    console.log('Calling actor curious_coder/linkedin-post-search-scraper...');
    // Let's test calling with correct options
    const run = await client.actor('curious_coder/linkedin-post-search-scraper').call({
      profileUrls: ['https://www.linkedin.com/in/yogesh-giri-6552b6224'],
      deepScrape: false,
      maxPosts: 5,
    }, {
      waitSecs: 30,
    });
    console.log('Apify Run status:', run.status, 'datasetId:', run.defaultDatasetId);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log('Scraped items count:', items.length);
    if (items.length > 0) {
      console.log('Sample item:', JSON.stringify(items[0], null, 2));
    }
  } catch (e) {
    console.error('Apify Error:', e.message);
  }
}

testAll();
