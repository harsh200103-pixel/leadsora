// ============================================================
// Intent Scoring Engine v2.0
// ============================================================
// Calculates a real intent score (0–99) based on multiple
// weighted signals extracted from job listing data.
// No random noise — every point is earned by a real signal.
// ============================================================

/**
 * SIGNAL WEIGHTS — each factor contributes a specific number
 * of points to the final intent score.
 */
const WEIGHTS = {
  BASE: 45,                // Every lead starts at 45 (baseline)
  JOB_RECENCY_TODAY: 30,   // Posted today = extremely hot
  JOB_RECENCY_1DAY: 20,    // Posted yesterday
  JOB_RECENCY_2DAY: 15,    // Posted 2 days ago
  JOB_RECENCY_3DAY: 10,    // Posted 3 days ago
  URGENCY_KEYWORD: 15,     // "urgent", "ASAP", "immediately"
  SENIORITY_HIGH: 12,      // "Head of", "Director", "VP", "C-level"
  SENIORITY_MID: 8,        // "Senior", "Lead", "Principal"
  COMPANY_GROWTH: 8,       // Series A–D, equity, funding signals
  CONTRACT_AGENCY: 15,     // "contract", "freelance", "agency" (Massive signal for B2B)
  STARTUP_SIGNAL: 6,       // "startup", "fast-paced", "scaling"
  REMOTE_SIGNAL: 4,        // "remote" (slightly higher urgency)
  MULTIPLE_ROLES: 5,       // Multiple openings mentioned
};

/**
 * Calculates how many days ago a date string represents.
 * Handles relative strings like "Today", "Yesterday", "3 days ago"
 * as well as ISO date strings.
 */
function parseDaysAgo(postedAt) {
  if (!postedAt) return 7; // Unknown = assume old
  const lower = postedAt.toLowerCase().trim();
  if (lower === 'today' || lower === 'just now') return 0;
  if (lower === 'yesterday') return 1;
  const match = lower.match(/(\d+)\s*day/);
  if (match) return parseInt(match[1]);
  // Try parsing as a date
  const parsed = new Date(postedAt);
  if (!isNaN(parsed.getTime())) {
    return Math.floor((Date.now() - parsed.getTime()) / 86400000);
  }
  return 7; // Default to old
}

/**
 * Score recency — fresher leads get dramatically higher scores.
 * This is the most important signal for buying intent.
 */
function scoreRecency(postedAt) {
  const days = parseDaysAgo(postedAt);
  if (days <= 0) return WEIGHTS.JOB_RECENCY_TODAY;    // Today: +24
  if (days <= 1) return WEIGHTS.JOB_RECENCY_1DAY;     // Yesterday: +18
  if (days <= 2) return WEIGHTS.JOB_RECENCY_2DAY;     // 2 days: +12
  if (days <= 3) return WEIGHTS.JOB_RECENCY_3DAY;     // 3 days: +6
  return 0;                                            // Older: +0
}

/**
 * Score urgency — looks for explicit urgency language
 * in the job description / title.
 */
function scoreUrgency(text) {
  const lower = (text || '').toLowerCase();
  const urgencyKeywords = [
    'urgent', 'urgently', 'asap', 'immediately', 'immediate',
    'right away', 'critical hire', 'must fill', 'priority hire',
    'needed yesterday', 'start immediately', 'emergency'
  ];
  // Check if any urgency keyword is present
  const hasUrgency = urgencyKeywords.some(kw => lower.includes(kw));
  return hasUrgency ? WEIGHTS.URGENCY_KEYWORD : 0;   // +12 or +0
}

/**
 * Score seniority — higher-level roles signal bigger budgets
 * and more decision-making authority (= higher intent).
 */
function scoreSeniority(text) {
  const lower = (text || '').toLowerCase();

  // C-suite and VP-level roles
  const highSeniority = [
    'head of', 'director', 'vp ', 'vice president',
    'chief ', 'cto', 'cfo', 'coo', 'ceo', 'cmo',
    'svp', 'evp', 'managing director'
  ];
  if (highSeniority.some(kw => lower.includes(kw))) {
    return WEIGHTS.SENIORITY_HIGH;                    // +9
  }

  // Mid-senior roles
  const midSeniority = [
    'senior', 'lead ', 'principal', 'staff ',
    'architect', 'manager', 'team lead'
  ];
  if (midSeniority.some(kw => lower.includes(kw))) {
    return WEIGHTS.SENIORITY_MID;                     // +5
  }

  return 0;
}

/**
 * Score company growth signals — companies that recently
 * raised funding or are scaling are more likely to buy services.
 */
function scoreGrowthSignals(text) {
  const lower = (text || '').toLowerCase();
  const growthKeywords = [
    'series a', 'series b', 'series c', 'series d',
    'raised', 'funding', 'backed by', 'equity',
    'venture', 'yc ', 'y combinator', 'well-funded',
    'hypergrowth', 'expanding', 'rapidly growing',
    'scaling', 'scale up', 'ipo'
  ];
  const hasGrowth = growthKeywords.some(kw => lower.includes(kw));
  return hasGrowth ? WEIGHTS.COMPANY_GROWTH : 0;      // +8 or +0
}

/**
 * Score contract/agency signals — companies looking for
 * contractors or agencies are direct buyers of your services.
 */
function scoreContractSignals(text) {
  const lower = (text || '').toLowerCase();
  const contractKeywords = [
    'contract', 'freelance', 'agency', 'consultant',
    'outsource', 'subcontract', 'on-demand', 'project-based',
    'retainer', 'fractional'
  ];
  const hasContract = contractKeywords.some(kw => lower.includes(kw));
  return hasContract ? WEIGHTS.CONTRACT_AGENCY : 0;   // +7 or +0
}

/**
 * Score startup signals — startups move faster and are
 * more likely to engage external help.
 */
function scoreStartupSignals(text) {
  const lower = (text || '').toLowerCase();
  const startupKeywords = [
    'startup', 'start-up', 'fast-paced', 'early-stage',
    'pre-seed', 'seed stage', 'bootstrapped'
  ];
  const hasStartup = startupKeywords.some(kw => lower.includes(kw));
  return hasStartup ? WEIGHTS.STARTUP_SIGNAL : 0;     // +4 or +0
}

/**
 * Score remote signal — remote positions indicate flexibility
 * and openness to external talent.
 */
function scoreRemoteSignal(text) {
  const lower = (text || '').toLowerCase();
  return lower.includes('remote') ? WEIGHTS.REMOTE_SIGNAL : 0; // +2 or +0
}

/**
 * Score multiple roles — companies hiring for multiple
 * positions simultaneously signal rapid growth.
 */
function scoreMultipleRoles(text) {
  const lower = (text || '').toLowerCase();
  const multiKeywords = [
    'multiple openings', 'multiple positions', 'hiring spree',
    'several roles', 'team expansion', 'bulk hiring'
  ];
  const hasMulti = multiKeywords.some(kw => lower.includes(kw));
  return hasMulti ? WEIGHTS.MULTIPLE_ROLES : 0;       // +5 or +0
}

// ============================================================
// MAIN SCORING FUNCTION
// ============================================================

/**
 * Calculate the intent score for a lead.
 * 
 * @param {string} text - Combined text from job title + description
 * @param {string} postedAt - When the job was posted (date string or relative)
 * @returns {Object} - { score: number, signals: string[] }
 * 
 * Score breakdown:
 *   BASE:              30 points
 *   Recency:        0–24 points
 *   Urgency:        0–12 points
 *   Seniority:       0–9 points
 *   Growth:          0–8 points
 *   Contract/Agency: 0–7 points
 *   Startup:         0–4 points
 *   Remote:          0–2 points
 *   Multiple Roles:  0–5 points
 *   ─────────────────────────
 *   MAXIMUM:           99 points (30 + 24 + 12 + 9 + 8 + 7 + 4 + 2 + 5 = 101, capped at 99)
 */
export function calculateIntentScore(text, postedAt) {
  const signals = [];
  let score = WEIGHTS.BASE;

  // 1. Recency (most important factor)
  const recencyPts = scoreRecency(postedAt);
  if (recencyPts > 0) signals.push(`Recency +${recencyPts}`);
  score += recencyPts;

  // 2. Urgency keywords
  const urgencyPts = scoreUrgency(text);
  if (urgencyPts > 0) signals.push(`Urgency +${urgencyPts}`);
  score += urgencyPts;

  // 3. Role seniority
  const seniorityPts = scoreSeniority(text);
  if (seniorityPts > 0) signals.push(`Seniority +${seniorityPts}`);
  score += seniorityPts;

  // 4. Company growth signals
  const growthPts = scoreGrowthSignals(text);
  if (growthPts > 0) signals.push(`Growth +${growthPts}`);
  score += growthPts;

  // 5. Contract/agency signals
  const contractPts = scoreContractSignals(text);
  if (contractPts > 0) signals.push(`Contract +${contractPts}`);
  score += contractPts;

  // 6. Startup signals
  const startupPts = scoreStartupSignals(text);
  if (startupPts > 0) signals.push(`Startup +${startupPts}`);
  score += startupPts;

  // 7. Remote signal
  const remotePts = scoreRemoteSignal(text);
  if (remotePts > 0) signals.push(`Remote +${remotePts}`);
  score += remotePts;

  // 8. Multiple roles signal
  const multiPts = scoreMultipleRoles(text);
  if (multiPts > 0) signals.push(`Multi-hire +${multiPts}`);
  score += multiPts;

  // Cap at 99
  return {
    score: Math.min(score, 99),
    signals
  };
}

/**
 * Quick score — returns just the number for backward compatibility.
 * Used by leadSources.js when building lead objects.
 */
export function calcIntentScore(text, postedAt) {
  return calculateIntentScore(text, postedAt).score;
}
