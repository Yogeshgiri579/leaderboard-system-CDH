/**
 * Calculate points for a single post based on AI analysis and engagement
 */
function calculatePostPoints(postAnalysis, likesCount = 0, commentsCount = 0) {
  if (!postAnalysis.isRelevant) {
    return 0;
  }

  let points = 50; // Base points for verified CloudDevOpsHub post

  if (postAnalysis.mentionsVikasRatnawat) {
    points += 30; // Mentorship tag bonus
  }

  // Quality score bonus (0 to 25 pts)
  const qualityBonus = Math.round((postAnalysis.aiRelevanceScore || 0) * 0.25);
  points += qualityBonus;

  // Social engagement bonus (up to 20 pts)
  const engagementBonus = Math.min(20, Math.floor((likesCount + commentsCount) / 4));
  points += engagementBonus;

  return points;
}

const { BATCH_45_MODULES } = require('../config/badgeConfig');

/**
 * Determine Module Expert status and title based on user statistics and topics covered
 */
function evaluateModuleExpertStatus(verifiedPostsCount, totalPoints, detectedTags = []) {
  const isExpert = verifiedPostsCount >= 3 && totalPoints >= 200;

  if (!isExpert) {
    return {
      isModuleExpert: false,
      moduleExpertBadge: '',
    };
  }

  const tagsLower = detectedTags.map((t) => t.toLowerCase());
  let badge = 'CloudDevOps Expert';

  if (tagsLower.includes('kubernetes') || tagsLower.includes('k8s')) {
    badge = 'K8s & Container Master';
  } else if (tagsLower.includes('terraform') || tagsLower.includes('iac')) {
    badge = 'IaC & Infrastructure Architect';
  } else if (tagsLower.includes('gitops') || tagsLower.includes('argocd') || tagsLower.includes('ci/cd')) {
    badge = 'GitOps & CI/CD Pioneer';
  } else if (tagsLower.includes('aws') || tagsLower.includes('cloud architecture')) {
    badge = 'AWS Cloud Solutions Pro';
  }

  return {
    isModuleExpert: true,
    moduleExpertBadge: badge,
  };
}

const MIN_POSTS_PER_BADGE = 5;

/**
 * Evaluate and unlock Batch 45 10-Module Badges for a candidate
 * Rule: Candidate must have a MINIMUM OF 5 VERIFIED POSTS classified into that module's category
 * @param {Array} verifiedPosts - Array of analyzed verified post objects
 * @param {Array} allKeywords - Array of extracted keywords
 */
function evaluateBatch45Badges(verifiedPosts = [], allKeywords = []) {
  const keywordsLower = allKeywords.map((k) => k.toLowerCase());

  const allBadgesStatus = BATCH_45_MODULES.map((mod) => {
    // Collect all verified posts that match this module category
    const matchingPosts = verifiedPosts.filter((p) => {
      // 1. AI or classifier explicitly assigned this module ID
      if (p.matchedModuleIds && p.matchedModuleIds.includes(mod.id)) {
        return true;
      }
      // 2. Keyword fallback against post text or detected keywords
      const textLower = (p.postText || '').toLowerCase();
      const postKeywords = (p.detectedKeywords || []).map((k) => k.toLowerCase());
      return mod.keywords.some(
        (kw) => textLower.includes(kw.toLowerCase()) || postKeywords.includes(kw.toLowerCase())
      );
    });

    const postCount = matchingPosts.length;
    const isUnlocked = postCount >= MIN_POSTS_PER_BADGE;
    const progressPercentage = Math.min(100, Math.round((postCount / MIN_POSTS_PER_BADGE) * 100));

    return {
      badgeId: mod.id,
      moduleNumber: mod.moduleNumber,
      code: mod.code,
      title: mod.title,
      subtitle: mod.subtitle,
      fullTitle: mod.fullTitle,
      color: mod.color,
      gradient: mod.gradient,
      description: mod.description,
      requiredPosts: MIN_POSTS_PER_BADGE,
      postCount,
      progressPercentage,
      isUnlocked,
      unlockedAt: isUnlocked ? (matchingPosts[MIN_POSTS_PER_BADGE - 1]?.postedAt || new Date()) : null,
      evidencePostUrl: matchingPosts.length > 0 ? (matchingPosts[0].postUrl || matchingPosts[0].linkedinPostUrl || '') : '',
      evidencePostsCount: postCount,
    };
  });

  const unlockedBadges = allBadgesStatus.filter((b) => b.isUnlocked);

  return {
    unlockedBadges,
    allBadgesStatus,
    unlockedCount: unlockedBadges.length,
    totalModules: BATCH_45_MODULES.length,
    minPostsRequired: MIN_POSTS_PER_BADGE,
  };
}

module.exports = {
  calculatePostPoints,
  evaluateModuleExpertStatus,
  evaluateBatch45Badges,
};

