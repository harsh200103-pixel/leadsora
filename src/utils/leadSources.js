// ============================================================
// Multi-Source Lead Aggregator Engine v2.0
// ============================================================
// Scans multiple free job/hiring APIs in parallel, normalizes
// results, and scores them with the real intent scoring engine.
//
// Changes from v1:
//   - Uses calcIntentScore() instead of fake random scores
//   - Uses generateOutreachSync() for varied outreach per lead
//   - Clean, readable code with named functions and comments
// ============================================================

import { calcIntentScore } from './intentScoring';
import { generateOutreachSync } from './outreachGenerator';

// All data sources we scan (or simulate scanning)
const SOURCES = [
  { id: 'remotive', name: 'Remotive', icon: '🌐', type: 'Remote Jobs' },
  { id: 'arbeitnow', name: 'Arbeitnow', icon: '🇪🇺', type: 'EU Jobs' },
  { id: 'jobicy', name: 'Jobicy', icon: '💼', type: 'Remote Careers' },
  { id: 'themuse', name: 'The Muse', icon: '🏢', type: 'Company Intel' },
  { id: 'usajobs', name: 'USAJobs.gov', icon: '🇺🇸', type: 'Gov Contracts' },
  { id: 'adzuna_us', name: 'Adzuna US', icon: '🔍', type: 'US Market' },
  { id: 'adzuna_uk', name: 'Adzuna UK', icon: '🇬🇧', type: 'UK Market' },
  { id: 'adzuna_au', name: 'Adzuna AU', icon: '🇦🇺', type: 'AU Market' },
  { id: 'adzuna_de', name: 'Adzuna DE', icon: '🇩🇪', type: 'DE Market' },
  { id: 'adzuna_in', name: 'Adzuna IN', icon: '🇮🇳', type: 'IN Market' },
  { id: 'findwork', name: 'FindWork.dev', icon: '⚡', type: 'Dev Hiring' },
  { id: 'himalayas', name: 'Himalayas', icon: '🏔️', type: 'Remote-First' },
  { id: 'remoteok', name: 'RemoteOK', icon: '✅', type: 'Remote Board' },
  { id: 'careerjet', name: 'CareerJet', icon: '🚀', type: 'Global Scan' },
  { id: 'jooble', name: 'Jooble', icon: '🔎', type: 'Meta Search' },
  { id: 'apify_apollo', name: 'Apollo Alternative', icon: '🎯', type: 'B2B Contacts' },
];

/** Export all source metadata for UI display */
export const getAllSources = () => SOURCES;

/**
 * Convert an ISO date string to a human-readable relative time.
 * Used by source fetchers to normalize posted dates.
 */
const timeAgo = (dateStr) => {
  if (!dateStr) return 'Recently';
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
};

/**
 * Returns true if a location string matches the selected country filter.
 * Falls back to true for 'Global' (no filter) or worldwide/remote tags.
 */
const LOCATION_TERMS = {
  'USA':       ['united states', 'us ', ', us', 'usa', 'u.s.', 'america', 'new york', 'california', 'texas', 'seattle', 'chicago'],
  'UK':        ['united kingdom', ' uk', ', uk', 'england', 'britain', 'london', 'u.k.', 'manchester'],
  'Canada':    ['canada', 'toronto', 'vancouver', 'montreal', 'ottawa'],
  'Australia': ['australia', 'sydney', 'melbourne', 'brisbane', 'perth'],
  'India':     ['india', 'bangalore', 'bengaluru', 'mumbai', 'delhi', 'hyderabad', 'pune', 'chennai', 'kolkata'],
  'Germany':   ['germany', 'berlin', 'munich', 'frankfurt', 'hamburg', 'cologne'],
  'UAE':       ['uae', 'dubai', 'united arab emirates', 'abu dhabi', 'sharjah'],
  'Singapore': ['singapore'],
};

const matchesLocation = (locationStr, filter) => {
  if (!filter || filter === 'Global') return true;
  if (!locationStr) return false;
  const loc = locationStr.toLowerCase();
  const terms = LOCATION_TERMS[filter] || [filter.toLowerCase()];
  return terms.some(term => loc.includes(term));
};

/**
 * Build a lead object with real intent scoring and varied outreach.
 * This is the single point where leads are normalized from any source.
 */
function buildLead({ id, company, country, title, description, sourceUrl, postedAt, sourceName, contactName, contactEmail, contactLinkedIn }) {
  // Combine title + description for scoring
  const fullText = `${title || ''} ${description || ''}`;

  // Real intent score based on actual signals
  const intentScore = calcIntentScore(fullText, postedAt);

  // Varied outreach — different template per company
  const outreach = generateOutreachSync(company, title);

  return {
    id,
    company,
    country: country || 'Global',
    intentScore,
    problem: `Hiring: ${title}`,
    outreach,
    sourceUrl: sourceUrl || '',
    postedAt: postedAt || 'Recently',
    source: sourceName,
    contactName: contactName || null,
    contactEmail: contactEmail || null,
    contactLinkedIn: contactLinkedIn || null,
  };
}


// ============================================================
// SOURCE FETCHERS
// Each fetcher calls a free public API and returns normalized leads.
// ============================================================

/** Fetch remote jobs from Remotive API */
const fetchRemotive = async (query, location) => {
  try {
    const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=30`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.jobs?.length) return [];

    let jobs = data.jobs;

    // Filter by location if not "Global"
    if (location !== 'Global') {
      jobs = jobs.filter(job => {
        const loc = (job.candidate_required_location || '').toLowerCase();
        return loc.includes(location.toLowerCase()) || loc.includes('worldwide') || loc.includes('anywhere');
      });
    }

    return jobs.slice(0, 5).map(job => buildLead({
      id: `rem-${job.id}`,
      company: job.company_name,
      country: job.candidate_required_location || 'Worldwide',
      title: job.title,
      description: job.description,
      sourceUrl: job.url,
      postedAt: timeAgo(job.publication_date),
      sourceName: 'Remotive',
    }));
  } catch {
    return [];
  }
};

/** Fetch EU jobs from Arbeitnow API */
const fetchArbeitnow = async (query, location) => {
  try {
    const url = `https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.data?.length) return [];

    return data.data
      .filter(job => matchesLocation(job.location, location))
      .slice(0, 5).map((job, i) => buildLead({
        id: `arb-${i}-${job.slug}`,
        company: job.company_name,
        country: job.location || 'Europe',
        title: job.title,
        description: job.description,
        sourceUrl: job.url,
        postedAt: timeAgo(job.created_at),
        sourceName: 'Arbeitnow',
      }));
  } catch {
    return [];
  }
};

/** Fetch remote jobs from Jobicy API */
const fetchJobicy = async (query, location) => {
  try {
    const url = `https://jobicy.com/api/v2/remote-jobs?count=10&tag=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.jobs?.length) return [];

    return data.jobs
      .filter(job => matchesLocation(job.jobGeo, location))
      .slice(0, 5).map((job, i) => buildLead({
        id: `jby-${i}-${job.id}`,
        company: job.companyName,
        country: job.jobGeo || 'Worldwide',
        title: job.jobTitle,
        description: job.jobDescription,
        sourceUrl: job.url,
        postedAt: timeAgo(job.pubDate),
        sourceName: 'Jobicy',
      }));
  } catch {
    return [];
  }
};

/** Fetch company intel from The Muse API */
const fetchTheMuse = async (query, location) => {
  try {
    const url = `https://www.themuse.com/api/public/jobs?page=1&descending=true&category=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results?.length) return [];

    return data.results
      .filter(job => matchesLocation(job.locations?.[0]?.name, location))
      .slice(0, 5).map((job, i) => buildLead({
        id: `muse-${i}-${job.id}`,
        company: job.company?.name || 'Unknown',
        country: job.locations?.[0]?.name || 'Global',
        title: job.name,
        description: job.contents,
        sourceUrl: job.refs?.landing_page,
        postedAt: timeAgo(job.publication_date),
        sourceName: 'The Muse',
      }));
  } catch {
    return [];
  }
};

/** Fetch remote-first jobs from Himalayas API */
const fetchHimalayas = async (query, location) => {
  try {
    const url = `https://himalayas.app/jobs/api?q=${encodeURIComponent(query)}&limit=10`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.jobs?.length) return [];

    return data.jobs
      .filter(job => matchesLocation(job.location, location))
      .slice(0, 5).map((job, i) => buildLead({
        id: `him-${i}-${job.id}`,
        company: job.companyName || job.company_name || 'Unknown',
        country: job.location || 'Remote',
        title: job.title,
        description: job.description,
        sourceUrl: `https://himalayas.app/jobs/${job.id}`,
        postedAt: timeAgo(job.pubDate || job.published_date),
        sourceName: 'Himalayas',
      }));
  } catch {
    return [];
  }
};

/** Fetch developer hiring from FindWork.dev API */
const fetchFindWork = async (query, location) => {
  try {
    const url = `https://findwork.dev/api/jobs/?search=${encodeURIComponent(query)}&order_by=-date_posted`;
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();

    if (!data.results?.length) return [];

    return data.results
      .filter(job => matchesLocation(job.location, location))
      .slice(0, 5).map((job, i) => buildLead({
        id: `fw-${i}-${job.id}`,
        company: job.company_name,
        country: job.location || 'Remote',
        title: job.role,
        description: job.text,
        sourceUrl: job.url,
        postedAt: timeAgo(job.date_posted),
        sourceName: 'FindWork',
      }));
  } catch {
    return [];
  }
};


/** Fetch B2B leads from Apify (Apollo Alternative Scraper) */
const fetchApifyApollo = async (query) => {
  const apiKey = localStorage.getItem('df_apify_api_key') || null;
  if (!apiKey) return [];

  try {
    // We use the synchronous dataset endpoint. This keeps the connection open until Apify finishes (up to 5 mins).
    // The actor ID "lucasnav/apollo-leads-finder" is the standard ID for the $1.5/1k scraper on Apify.
    const url = `https://api.apify.com/v2/acts/lucasnav~apollo-leads-finder/run-sync-get-dataset-items?token=${apiKey}`;
    
    // We pass the search query as input to the Apify Actor
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        search_query: query,
        limit: 10 // keeping it small for quick testing
      })
    });
    
    const data = await response.json();
    if (!data || !Array.isArray(data)) return [];

    return data.slice(0, 5).map((lead, i) => buildLead({
      id: `api-apollo-${i}`,
      company: lead.company_name || 'Unknown Company',
      country: lead.location || 'Global',
      title: lead.job_title || query,
      description: `${lead.first_name || ''} ${lead.last_name || ''} is ${lead.job_title} at ${lead.company_name}`.trim(),
      sourceUrl: lead.company_website || lead.linkedin_url || '',
      postedAt: 'Just Now',
      sourceName: 'Apollo via Apify',
      contactName: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || null,
      contactEmail: lead.email || null,
      contactLinkedIn: lead.linkedin_url || null,
    }));
  } catch (err) {
    console.warn('Apify fetch failed:', err);
    return [];
  }
};


// ============================================================
// MAIN AGGREGATOR
// ============================================================

/**
 * Scan all sources for leads matching the query.
 * Fires API calls in parallel with staggered UI updates,
 * then deduplicates by company name (keeping highest score).
 *
 * @param {string} query - Search query (niche/role)
 * @param {string} location - Target location filter
 * @param {function} onSourceUpdate - Callback for UI progress updates
 * @returns {Promise<Array>} - Sorted, deduplicated leads
 */
export const scanAllSources = async (query, location, onSourceUpdate) => {
  // Active fetchers — sources with real API integrations
  const fetchers = [
    { source: SOURCES[0],  fn: () => fetchRemotive(query, location) },  // Remotive
    { source: SOURCES[1],  fn: () => fetchArbeitnow(query, location) }, // Arbeitnow
    { source: SOURCES[2],  fn: () => fetchJobicy(query, location) },    // Jobicy
    { source: SOURCES[3],  fn: () => fetchTheMuse(query, location) },   // The Muse
    { source: SOURCES[10], fn: () => fetchFindWork(query, location) },  // FindWork
    { source: SOURCES[11], fn: () => fetchHimalayas(query, location) }, // Himalayas
  ];

  // If Apify Key exists, add it to the active fetchers
  if (localStorage.getItem('df_apify_api_key')) {
    fetchers.push({ source: SOURCES[15], fn: () => fetchApifyApollo(query) });
  }

  // Passive sources — shown in UI but no API (yet)
  const passiveSources = SOURCES.filter(
    s => !fetchers.find(f => f.source.id === s.id)
  );

  // Fire all API calls in parallel with staggered UI updates
  const results = await Promise.allSettled(
    fetchers.map(async (f, i) => {
      // Stagger so the UI shows progressive scanning
      await new Promise(r => setTimeout(r, i * 400));
      onSourceUpdate?.({ source: f.source, status: 'scanning' });

      const leads = await f.fn();
      onSourceUpdate?.({ source: f.source, status: 'done', count: leads.length });
      return leads;
    })
  );

  // Simulate scanning passive sources (shows them in the UI)
  for (const ps of passiveSources) {
    onSourceUpdate?.({ source: ps, status: 'scanning' });
    await new Promise(r => setTimeout(r, 200));
    onSourceUpdate?.({ source: ps, status: 'done', count: 0 });
  }

  // Flatten all results into a single array
  let allLeads = [];
  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value?.length) {
      allLeads = [...allLeads, ...result.value];
    }
  });

  // Deduplicate by company name — keep the highest-scoring lead
  const seen = new Map();
  allLeads.forEach(lead => {
    const key = (lead.company || '').toLowerCase().trim();
    if (!key) return;
    if (!seen.has(key) || seen.get(key).intentScore < lead.intentScore) {
      seen.set(key, lead);
    }
  });

  // Return top 15 leads sorted by intent score (descending)
  return Array.from(seen.values())
    .sort((a, b) => b.intentScore - a.intentScore)
    .slice(0, 15);
};
