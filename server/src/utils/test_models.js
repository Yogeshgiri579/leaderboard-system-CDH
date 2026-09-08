const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const axios = require('axios');

async function testWorkingModel() {
  const geminiKey = process.env.GEMINI_API_KEY;
  for (const model of ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest']) {
    try {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        {
          contents: [{ parts: [{ text: 'Return JSON: {"status": "success", "model": "' + model + '"}' }] }],
          generationConfig: { responseMimeType: 'application/json' },
        },
        { timeout: 8000 }
      );
      console.log(`✅ Model ${model} is WORKING! Output:`, res.data?.candidates?.[0]?.content?.parts?.[0]?.text);
      return model;
    } catch (e) {
      console.log(`❌ Model ${model} failed:`, e.response?.status, e.response?.data?.error?.message || e.message);
    }
  }
}

testWorkingModel();
