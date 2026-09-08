const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { ApifyClient } = require('apify-client');

async function checkApifyActors() {
  const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
  try {
    const list = await client.store().list({ search: 'linkedin post' });
    console.log(`Found ${list.items.length} actors for 'linkedin post'`);
    list.items.slice(0, 10).forEach(a => {
      console.log(`- ${a.username}/${a.name} (Pricing: ${JSON.stringify(a.pricingInfos?.map(p=>p.pricingModel))})`);
    });
  } catch (e) {
    console.error('Store error:', e.message);
  }
}

checkApifyActors();
