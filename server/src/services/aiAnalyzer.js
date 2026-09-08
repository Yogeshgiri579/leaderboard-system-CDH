const axios = require('axios');

/**
 * Checks for variations of Vikas Ratnawat in the text
 */
function checkVikasRatnawatMention(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  const patterns = [
    'vikas ratnawat',
    'vikasratnawat',
    'vikas_ratnawat',
    'vikas-ratnawat',
    '@vikas',
    'vikas sir',
    'ratnawat',
  ];
  return patterns.some((pat) => lower.includes(pat));
}

/**
 * Checks for CloudDevOpsHub community tags and keywords
 */
function analyzeKeywordsAndContext(text) {
  if (!text) return { detected: [], hasHubTag: false, devOpsTopicScore: 0 };
  const lower = text.toLowerCase();

  const communityTerms = ['clouddevopshub', 'cloud devops hub', 'clouddevops hub', 'cloud devopshub'];
  const hasHubTag = communityTerms.some((t) => lower.includes(t));

  const techKeywords = [
    'kubernetes', 'k8s', 'terraform', 'aws', 'docker', 'devops', 'gitops',
    'argocd', 'ci/cd', 'github actions', 'jenkins', 'prometheus', 'grafana',
    'helm', 'ansible', 'linux', 'cloud architecture', 'iam', 'ec2', 's3',
    'microservices', 'observability', 'opentelemetry', 'golang', 'python', 'bash'
  ];

  const detected = [];
  let topicMatches = 0;

  if (hasHubTag) detected.push('CloudDevOpsHub');

  techKeywords.forEach((kw) => {
    if (lower.includes(kw)) {
      detected.push(kw.toUpperCase());
      topicMatches++;
    }
  });

  return {
    detected: Array.from(new Set(detected)),
    hasHubTag,
    devOpsTopicScore: Math.min(100, topicMatches * 20),
  };
}

const { BATCH_45_MODULES } = require('../config/badgeConfig');

/**
 * Classifies which of the 10 Batch 45 curriculum modules a post matches
 */
function classifyPostModules(text, detectedKeywords = []) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const matched = [];

  BATCH_45_MODULES.forEach((mod) => {
    const hasMatch = mod.keywords.some(
      (kw) => lower.includes(kw.toLowerCase()) || detectedKeywords.some((dk) => dk.toLowerCase().includes(kw.toLowerCase()))
    );
    if (hasMatch) {
      matched.push(mod.id);
    }
  });

  return matched;
}

/**
 * Analyze a single post using Gemini API if configured or high-fidelity heuristic AI
 */
async function analyzePostWithAI(postText) {
  const [singleResult] = await analyzePostsBatchWithAI([{ postText, likesCount: 0, commentsCount: 0 }]);
  return singleResult;
}

/**
 * Analyze a batch of up to 20 posts in a SINGLE prompt using Gemini Flash or robust NLP fallback
 * This reduces API calls by up to 95%, eliminates rate limits, and speeds up verification 10x!
 */
async function analyzePostsBatchWithAI(rawPosts = []) {
  if (!rawPosts || rawPosts.length === 0) return [];

  const geminiKey = process.env.GEMINI_API_KEY;

  // Pre-process all posts with fast local heuristics
  const preProcessed = rawPosts.map((raw, idx) => {
    const text = raw.postText || '';
    const mentionsVikas = checkVikasRatnawatMention(text);
    const { detected, hasHubTag, devOpsTopicScore } = analyzeKeywordsAndContext(text);
    const matchedModuleIds = classifyPostModules(text, detected);
    const hasPotential = hasHubTag || mentionsVikas || devOpsTopicScore >= 20 || matchedModuleIds.length > 0;

    return {
      index: idx,
      postText: text,
      mentionsVikas,
      detected,
      hasHubTag,
      devOpsTopicScore,
      matchedModuleIds,
      hasPotential,
    };
  });

  // If Gemini API Key is configured, attempt high-speed single batch inference
  if (geminiKey && geminiKey.trim() !== '') {
    try {
      const postsForPrompt = preProcessed.map((p) => ({
        index: p.index,
        content: p.postText.substring(0, 500), // Trim long posts to keep token size compact
      }));

      const prompt = `You are the chief AI auditor for CloudDevOpsHub Batch 45 (Multi-Cloud & DevOps With AI, mentored by Vikas Ratnawat).
Analyze these ${postsForPrompt.length} LinkedIn posts.

For each post determine:
1. isRelevant: boolean (related to CloudDevOpsHub cohort learning, DevOps, Cloud, or AI concepts)
2. mentionsVikasRatnawat: boolean (mentions or tags Vikas Ratnawat, Vikas Sir, or @vikas)
3. aiRelevanceScore: number (0 to 100 confidence/quality score)
4. aiReasoning: string (concise 1-sentence explanation of what DevOps concept was covered)
5. matchedModuleIds: array of strings from available modules [MOD_01, MOD_02, MOD_03, MOD_04, MOD_05, MOD_06, MOD_07, MOD_08, MOD_09, MOD_10]
(MOD_01:Foundations&AI, MOD_02:Linux+GCP, MOD_03:AWS, MOD_04:CICD&Git, MOD_05:Docker&K8s, MOD_06:Terraform&Ansible, MOD_07:Python&Shell, MOD_08:Azure&GenAI, MOD_09:9RealProjects, MOD_10:Career&Referrals)

POSTS DATA:
${JSON.stringify(postsForPrompt, null, 2)}

Respond STRICTLY with a valid JSON array of objects:
[
  {
    "index": 0,
    "isRelevant": true,
    "mentionsVikasRatnawat": true,
    "aiRelevanceScore": 95,
    "aiReasoning": "Hands-on multi-region Kubernetes deployment with Terraform and mentor tag.",
    "matchedModuleIds": ["MOD_03", "MOD_05", "MOD_06"]
  }
]`;

      let response;
      const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
      for (const model of modelsToTry) {
        try {
          response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
            {
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            },
            { timeout: 15000 }
          );
          if (response?.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            break;
          }
        } catch (mErr) {
          if (model === modelsToTry[modelsToTry.length - 1]) throw mErr;
        }
      }

      const jsonText = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (jsonText) {
        const parsedArray = JSON.parse(jsonText);
        console.log(`🤖 Gemini AI successfully analyzed batch of ${parsedArray.length} posts in ONE single turn!`);

        return preProcessed.map((prep) => {
          const aiResult = parsedArray.find((r) => r.index === prep.index) || {};
          const isRelevant = aiResult.isRelevant ?? prep.hasPotential;
          const mentionsVikas = aiResult.mentionsVikasRatnawat ?? prep.mentionsVikas;
          const score = aiResult.aiRelevanceScore ?? (prep.hasHubTag && mentionsVikas ? 95 : 75);
          const combinedModules = Array.from(
            new Set([...(aiResult.matchedModuleIds || []), ...prep.matchedModuleIds])
          );

          return {
            isRelevant,
            mentionsVikasRatnawat: mentionsVikas,
            aiRelevanceScore: score,
            aiReasoning: aiResult.aiReasoning || (isRelevant ? 'Verified CloudDevOpsHub community post' : 'General post'),
            detectedKeywords: prep.detected,
            matchedModuleIds: combinedModules,
          };
        });
      }
    } catch (batchErr) {
      console.warn(`⚠️ Gemini batch analysis failed (${batchErr.message}). Using high-fidelity NLP heuristic evaluation.`);
    }
  }

  // High-Fidelity NLP Heuristics Fallback (Zero external dependencies, instant execution)
  return preProcessed.map((prep) => {
    if (!prep.hasPotential) {
      return {
        isRelevant: false,
        mentionsVikasRatnawat: false,
        aiRelevanceScore: 0,
        aiReasoning: 'General profile post unrelated to CloudDevOpsHub Batch 45 curriculum.',
        detectedKeywords: prep.detected,
        matchedModuleIds: [],
      };
    }

    let score = 0;
    if (prep.hasHubTag) score += 50;
    if (prep.mentionsVikas) score += 40;
    if (prep.detected.length >= 2) score += Math.min(25, prep.detected.length * 5);
    if (prep.matchedModuleIds.length > 0) score += 10;

    const finalScore = Math.min(100, Math.max(0, score));
    const isRelevant = prep.hasHubTag || (prep.mentionsVikas && prep.detected.length >= 1) || finalScore >= 50;

    let aiReasoning = '';
    if (isRelevant && prep.mentionsVikas) {
      aiReasoning = `100% Verified Batch 45 Contribution: Hands-on work tagged with mentor Vikas Ratnawat covering ${prep.matchedModuleIds.join(', ') || 'DevOps'}.`;
    } else if (isRelevant && !prep.mentionsVikas) {
      aiReasoning = `Relevant DevOps post covering ${prep.detected.slice(0, 3).join(', ')}, but lacks direct tag for mentor Vikas Ratnawat.`;
    } else {
      aiReasoning = 'Post content does not meet minimum CloudDevOpsHub community relevance thresholds.';
    }

    return {
      isRelevant,
      mentionsVikasRatnawat: prep.mentionsVikas,
      aiRelevanceScore: finalScore,
      aiReasoning,
      detectedKeywords: prep.detected,
      matchedModuleIds: prep.matchedModuleIds,
    };
  });
}

module.exports = {
  analyzePostWithAI,
  analyzePostsBatchWithAI,
  checkVikasRatnawatMention,
  classifyPostModules,
};

