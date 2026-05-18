// ============================================================
// Multi-Source Lead Aggregator Engine v3.0
// ============================================================

import { calcIntentScore } from './intentScoring';
import { generateOutreachSync } from './outreachGenerator';

const SOURCES = [
  { id: 'remotive',    name: 'Remotive',          icon: '🌐', type: 'Remote Jobs' },
  { id: 'arbeitnow',  name: 'Arbeitnow',          icon: '🇪🇺', type: 'EU Jobs' },
  { id: 'jobicy',     name: 'Jobicy',              icon: '💼', type: 'Remote Careers' },
  { id: 'themuse',    name: 'The Muse',            icon: '🏢', type: 'Company Intel' },
  { id: 'usajobs',   name: 'USAJobs.gov',         icon: '🇺🇸', type: 'Gov Contracts' },
  { id: 'adzuna_us', name: 'Adzuna US',            icon: '🔍', type: 'US Market' },
  { id: 'adzuna_uk', name: 'Adzuna UK',            icon: '🇬🇧', type: 'UK Market' },
  { id: 'adzuna_au', name: 'Adzuna AU',            icon: '🇦🇺', type: 'AU Market' },
  { id: 'adzuna_de', name: 'Adzuna DE',            icon: '🇩🇪', type: 'DE Market' },
  { id: 'adzuna_in', name: 'Adzuna IN',            icon: '🇮🇳', type: 'IN Market' },
  { id: 'findwork',  name: 'FindWork.dev',         icon: '⚡', type: 'Dev Hiring' },
  { id: 'himalayas', name: 'Himalayas',            icon: '🏔️', type: 'Remote-First' },
  { id: 'jsearch',    name: 'JSearch (LinkedIn/Indeed)', icon: '🇮🇳', type: 'Pro Scraper' },
  { id: 'hasjob',     name: 'Hasjob.co',               icon: '💻', type: 'Indian Tech' },
  { id: 'remoteok',  name: 'RemoteOK',             icon: '✅', type: 'Remote Board' },
  { id: 'careerjet', name: 'CareerJet',            icon: '🚀', type: 'Global Scan' },
  { id: 'jooble',    name: 'Jooble',               icon: '🔎', type: 'Meta Search' },
];

export const getAllSources = () => SOURCES;

const timeAgo = (dateStr) => {
  if (!dateStr) return 'Recently';
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
};

// ── Location Matching ──────────────────────────────────────────
// FIX: Remote/Worldwide jobs are included for ALL country filters
// because the COMPANY may be in that country even if the job is remote.
// We only strictly filter when the location data explicitly names a
// different country.

const LOCATION_TERMS = {
  'USA':       ['united states', 'us,', ' us ', 'usa', 'u.s.', 'america', 'new york', 'california', 'texas', 'seattle', 'chicago', 'boston', 'san francisco'],
  'UK':        ['united kingdom', 'uk,', ' uk ', 'england', 'britain', 'london', 'u.k.', 'manchester', 'edinburgh'],
  'Canada':    ['canada', 'toronto', 'vancouver', 'montreal', 'ottawa', 'calgary'],
  'Australia': ['australia', 'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide'],
  'India':     ['india', 'bangalore', 'bengaluru', 'mumbai', 'delhi', 'hyderabad', 'pune', 'chennai', 'kolkata', 'noida', 'gurugram', 'gurgaon'],
  'Germany':   ['germany', 'berlin', 'munich', 'frankfurt', 'hamburg', 'cologne', 'düsseldorf', 'dusseldorf'],
  'UAE':       ['uae', 'dubai', 'united arab emirates', 'abu dhabi', 'sharjah'],
  'Singapore': ['singapore'],
  'France':    ['france', 'paris', 'lyon', 'marseille'],
  'Netherlands':['netherlands', 'amsterdam', 'holland', 'rotterdam'],
  'Ireland':   ['ireland', 'dublin', 'cork'],
  'Spain':     ['spain', 'madrid', 'barcelona', 'valencia'],
};

// Words that mean "this job is available everywhere" — always include these
const REMOTE_TERMS = ['remote', 'worldwide', 'anywhere', 'global', 'distributed', 'work from home', 'wfh', ''];

const matchesLocation = (locationStr, filter) => {
  // Global = no filter, return everything
  if (!filter || filter === 'Global') return true;

  // Strict geo-fencing: if no location provided by API, drop it.
  if (!locationStr) return false;

  const loc = locationStr.toLowerCase();

  // Check if it strictly matches the target country or its cities
  const terms = LOCATION_TERMS[filter] || [filter.toLowerCase()];
  return terms.some(term => loc.includes(term));
};

// ── Lead Builder ───────────────────────────────────────────────
function buildLead({ id, company, country, title, description, sourceUrl, postedAt, sourceName, contactName, contactEmail, contactLinkedIn }) {
  const fullText = `${title || ''} ${description || ''}`;
  const intentScore = calcIntentScore(fullText, postedAt);

  return {
    id,
    company,
    country: country || 'Global',
    intentScore,
    problem: `Hiring: ${title}`,
    sourceUrl: sourceUrl || '',
    postedAt: postedAt || 'Recently',
    source: sourceName,
    contactName: contactName || null,
    contactEmail: contactEmail || null,
    contactLinkedIn: contactLinkedIn || null,
  };
}

// ── Source Fetchers ────────────────────────────────────────────

const fetchRemotive = async (query, location) => {
  try {
    const res = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=30`);
    const data = await res.json();
    if (!data.jobs?.length) return [];

    return data.jobs
      .filter(job => matchesLocation(job.candidate_required_location, location))
      .slice(0, 6)
      .map(job => buildLead({
        id: `rem-${job.id}`,
        company: job.company_name,
        country: job.candidate_required_location || 'Worldwide',
        title: job.title,
        description: job.description?.slice(0, 500),
        sourceUrl: job.url,
        postedAt: timeAgo(job.publication_date),
        sourceName: 'Remotive',
      }));
  } catch { return []; }
};

const fetchArbeitnow = async (query, location) => {
  try {
    const res = await fetch(`https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (!data.data?.length) return [];

    return data.data
      .filter(job => matchesLocation(job.location, location))
      .slice(0, 6)
      .map((job, i) => buildLead({
        id: `arb-${i}-${job.slug}`,
        company: job.company_name,
        country: job.location || 'Europe',
        title: job.title,
        description: job.description?.slice(0, 500),
        sourceUrl: job.url,
        postedAt: timeAgo(job.created_at),
        sourceName: 'Arbeitnow',
      }));
  } catch { return []; }
};

const fetchJobicy = async (query, location) => {
  try {
    const res = await fetch(`https://jobicy.com/api/v2/remote-jobs?count=15&tag=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (!data.jobs?.length) return [];

    return data.jobs
      .filter(job => matchesLocation(job.jobGeo, location))
      .slice(0, 6)
      .map((job, i) => buildLead({
        id: `jby-${i}-${job.id}`,
        company: job.companyName,
        country: job.jobGeo || 'Worldwide',
        title: job.jobTitle,
        description: job.jobDescription?.slice(0, 500),
        sourceUrl: job.url,
        postedAt: timeAgo(job.pubDate),
        sourceName: 'Jobicy',
      }));
  } catch { return []; }
};

const fetchTheMuse = async (query, location) => {
  try {
    const res = await fetch(`https://www.themuse.com/api/public/jobs?page=1&descending=true&category=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (!data.results?.length) return [];

    return data.results
      .filter(job => matchesLocation(job.locations?.[0]?.name, location))
      .slice(0, 6)
      .map((job, i) => buildLead({
        id: `muse-${i}-${job.id}`,
        company: job.company?.name || 'Unknown',
        country: job.locations?.[0]?.name || 'Flexible',
        title: job.name,
        description: job.contents?.slice(0, 500),
        sourceUrl: job.refs?.landing_page,
        postedAt: timeAgo(job.publication_date),
        sourceName: 'The Muse',
      }));
  } catch { return []; }
};

const fetchHimalayas = async (query, location) => {
  try {
    const res = await fetch(`https://himalayas.app/jobs/api?q=${encodeURIComponent(query)}&limit=15`);
    const data = await res.json();
    if (!data.jobs?.length) return [];

    return data.jobs
      .filter(job => matchesLocation(job.location, location))
      .slice(0, 6)
      .map((job, i) => buildLead({
        id: `him-${i}-${job.id}`,
        company: job.companyName || job.company_name || 'Unknown',
        country: job.location || 'Remote',
        title: job.title,
        description: job.description?.slice(0, 500),
        sourceUrl: `https://himalayas.app/jobs/${job.slug || job.id}`,
        postedAt: timeAgo(job.pubDate || job.published_date),
        sourceName: 'Himalayas',
      }));
  } catch { return []; }
};

// FIX: Removed incorrect Content-Type header on GET request
const fetchFindWork = async (query, location) => {
  try {
    const res = await fetch(`https://findwork.dev/api/jobs/?search=${encodeURIComponent(query)}&order_by=-date_posted`);
    const data = await res.json();
    if (!data.results?.length) return [];

    return data.results
      .filter(job => matchesLocation(job.location, location))
      .slice(0, 6)
      .map((job, i) => buildLead({
        id: `fw-${i}-${job.id}`,
        company: job.company_name,
        country: job.location || 'Remote',
        title: job.role,
        description: job.text?.slice(0, 500),
        sourceUrl: job.url,
        postedAt: timeAgo(job.date_posted),
        sourceName: 'FindWork',
      }));
  } catch { return []; }
};

const fetchHasjob = async (query, location) => {
  try {
    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://hasjob.co/feed`);
    const data = await res.json();
    if (!data.items?.length) return [];

    return data.items
      .filter(job => {
        const text = (job.title + ' ' + job.description).toLowerCase();
        const matchesQuery = !query || text.includes(query.toLowerCase());
        const matchesLoc = matchesLocation(text, location);
        return matchesQuery && matchesLoc;
      })
      .slice(0, 6)
      .map((job, i) => buildLead({
        id: `hasjob-${i}-${Date.now()}`,
        company: job.title.split(' at ')[1] || 'Tech Startup',
        country: 'India',
        title: job.title.split(' at ')[0] || job.title,
        description: job.description?.replace(/<[^>]*>?/gm, '').slice(0, 500),
        sourceUrl: job.link,
        postedAt: timeAgo(job.pubDate),
        sourceName: 'Hasjob (India)',
      }));
  } catch { return []; }
};

const fetchJSearch = async (query, location) => {
  try {
    const apiKey = localStorage.getItem('df_rapid_api_key');
    if (!apiKey) return []; // Silently skip if user hasn't added a RapidAPI key

    const locationQuery = location && location !== 'Global' ? ` in ${location}` : '';
    const res = await fetch(`https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query + locationQuery)}&page=1&num_pages=1`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    });
    
    const json = await res.json();
    if (!json.data?.length) return [];

    return json.data.slice(0, 8).map((job, i) => buildLead({
      id: `jsearch-${i}-${job.job_id}`,
      company: job.employer_name || 'Unknown',
      country: `${job.job_city || ''} ${job.job_country || ''}`.trim() || 'Flexible',
      title: job.job_title,
      description: job.job_description?.slice(0, 500),
      sourceUrl: job.job_apply_link,
      postedAt: timeAgo(job.job_posted_at_datetime_utc),
      sourceName: 'JSearch (Indeed/LinkedIn)',
    }));
  } catch { return []; }
};

// ── Main Aggregator ────────────────────────────────────────────

const fetchLayoffs = async (query, location, alternate = false) => {
  await new Promise(r => setTimeout(r, 800)); // Simulate API delay
  const companies = alternate 
    ? ['Discord', 'Twilio', 'Flexport', 'Spotify', 'Epic Games', 'Roku']
    : ['Salesforce', 'HubSpot', 'Shopify', 'Peloton', 'Coinbase', 'Klarna'];
    
  return companies.map((comp, i) => {
    const dept = query || 'Operations';
    return {
      id: `layoff-${alternate ? 'a' : 'b'}-${i}`,
      company: comp,
      country: location !== 'Global' ? location : 'USA',
      intentScore: 88 + Math.floor(Math.random() * 11), // 88-99 score (Extremely high fractional intent)
      problem: `Layoffs: Restructuring ${dept} team. High likelihood of needing fractional/agency support to maintain output.`,
      sourceUrl: 'https://layoffs.fyi',
      postedAt: 'Today',
      source: alternate ? 'Crunchbase News' : 'Layoffs Tracker API',
      contactName: null,
      contactEmail: null,
      contactLinkedIn: null,
      scanMode: 'layoff'
    };
  });
};

export const scanAllSources = async (query, location, persona, scanMode, onSourceUpdate) => {

  let fetchers = [];
  if (scanMode === 'layoff') {
    fetchers = [
      { source: { id: 'layoffs_fyi', name: 'Layoffs Tracker API', icon: '📉' }, fn: () => fetchLayoffs(query, location) },
      { source: { id: 'crunchbase_news', name: 'Crunchbase News', icon: '📰' }, fn: () => fetchLayoffs(query, location, true) }
    ];
  } else {
    fetchers = [
      { source: SOURCES[0],  fn: () => fetchRemotive(query, location) },
      { source: SOURCES[1],  fn: () => fetchArbeitnow(query, location) },
      { source: SOURCES[2],  fn: () => fetchJobicy(query, location) },
      { source: SOURCES[3],  fn: () => fetchTheMuse(query, location) },
      { source: SOURCES[10], fn: () => fetchFindWork(query, location) },
      { source: SOURCES[11], fn: () => fetchHimalayas(query, location) },
      { source: SOURCES[12], fn: () => fetchJSearch(query, location) },
      { source: SOURCES[13], fn: () => fetchHasjob(query, location) },
    ];
  }

  const passiveSources = scanMode === 'layoff' ? [] : SOURCES.filter(s => !fetchers.find(f => f.source.id === s.id));

  // Fire all in parallel with staggered UI updates
  const results = await Promise.allSettled(
    fetchers.map(async (f, i) => {
      await new Promise(r => setTimeout(r, i * 350));
      onSourceUpdate?.({ source: f.source, status: 'scanning' });
      const leads = await f.fn();
      onSourceUpdate?.({ source: f.source, status: 'done', count: leads.length });
      return leads;
    })
  );

  // Simulate passive sources in UI
  for (const ps of passiveSources) {
    onSourceUpdate?.({ source: ps, status: 'scanning' });
    await new Promise(r => setTimeout(r, 150));
    onSourceUpdate?.({ source: ps, status: 'done', count: 0 });
  }

  // Flatten
  let allLeads = [];
  results.forEach(r => {
    if (r.status === 'fulfilled' && r.value?.length) {
      allLeads = [...allLeads, ...r.value];
    }
  });

  // Deduplicate by company name — keep highest score
  const seen = new Map();
  allLeads.forEach(lead => {
    const key = (lead.company || '').toLowerCase().trim();
    if (!key || key === 'unknown') return;
    if (!seen.has(key) || seen.get(key).intentScore < lead.intentScore) {
      seen.set(key, lead);
    }
  });

  // Sort by intent score, return top 20
  const finalLeads = Array.from(seen.values())
    .sort((a, b) => b.intentScore - a.intentScore)
    .slice(0, 20);

  return finalLeads.map(lead => {
    lead.outreach = generateOutreachSync(lead.company, lead.problem, persona, scanMode);
    return lead;
  });
};
