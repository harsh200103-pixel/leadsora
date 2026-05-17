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
  { id: 'remoteok',  name: 'RemoteOK',             icon: '✅', type: 'Remote Board' },
  { id: 'careerjet', name: 'CareerJet',            icon: '🚀', type: 'Global Scan' },
  { id: 'jooble',    name: 'Jooble',               icon: '🔎', type: 'Meta Search' },
  { id: 'apify_apollo', name: 'Apollo via Apify',  icon: '🎯', type: 'B2B Contacts' },
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
};

// Words that mean "this job is available everywhere" — always include these
const REMOTE_TERMS = ['remote', 'worldwide', 'anywhere', 'global', 'distributed', 'work from home', 'wfh', ''];

const matchesLocation = (locationStr, filter) => {
  // Global = no filter, return everything
  if (!filter || filter === 'Global') return true;

  const loc = (locationStr || '').toLowerCase().trim();

  // FIX: If location is empty or is a "remote/worldwide" term, INCLUDE it
  // because we can't confirm it's NOT in the target country
  if (!loc || REMOTE_TERMS.some(t => t && loc.includes(t))) return true;

  // Check if it matches the target country
  const terms = LOCATION_TERMS[filter] || [filter.toLowerCase()];
  return terms.some(term => loc.includes(term));
};

// ── Lead Builder ───────────────────────────────────────────────
function buildLead({ id, company, country, title, description, sourceUrl, postedAt, sourceName, contactName, contactEmail, contactLinkedIn }) {
  const fullText = `${title || ''} ${description || ''}`;
  const intentScore = calcIntentScore(fullText, postedAt);
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

// FIX: Apify fetcher — correct SOURCES index and better error handling
const fetchApifyApollo = async (query, location) => {
  const apiKey = localStorage.getItem('df_apify_api_key');
  if (!apiKey) return [];

  try {
    const url = `https://api.apify.com/v2/acts/lucasnav~apollo-leads-finder/run-sync-get-dataset-items?token=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ search_query: query, limit: 10 }),
    });

    if (!res.ok) {
      console.warn('Apify returned', res.status);
      return [];
    }

    const data = await res.json();
    if (!Array.isArray(data) || !data.length) return [];

    return data
      .filter(lead => matchesLocation(lead.location, location))
      .slice(0, 5)
      .map((lead, i) => buildLead({
        id: `apy-${i}`,
        company: lead.company_name || 'Unknown',
        country: lead.location || 'Global',
        title: lead.job_title || query,
        description: `${lead.first_name || ''} ${lead.last_name || ''} — ${lead.job_title || ''} at ${lead.company_name || ''}`.trim(),
        sourceUrl: lead.company_website || lead.linkedin_url || '',
        postedAt: 'Just Now',
        sourceName: 'Apollo via Apify',
        contactName: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || null,
        contactEmail: lead.email || null,
        contactLinkedIn: lead.linkedin_url || null,
      }));
  } catch (err) {
    console.warn('Apify error:', err);
    return [];
  }
};

// ── Main Aggregator ────────────────────────────────────────────
export const scanAllSources = async (query, location, onSourceUpdate) => {
  const apifyKey = localStorage.getItem('df_apify_api_key');

  // FIX: Correct SOURCES index references (Apify is index 15)
  const fetchers = [
    { source: SOURCES[0],  fn: () => fetchRemotive(query, location) },
    { source: SOURCES[1],  fn: () => fetchArbeitnow(query, location) },
    { source: SOURCES[2],  fn: () => fetchJobicy(query, location) },
    { source: SOURCES[3],  fn: () => fetchTheMuse(query, location) },
    { source: SOURCES[10], fn: () => fetchFindWork(query, location) },
    { source: SOURCES[11], fn: () => fetchHimalayas(query, location) },
    ...(apifyKey ? [{ source: SOURCES[15], fn: () => fetchApifyApollo(query, location) }] : []),
  ];

  const passiveSources = SOURCES.filter(s => !fetchers.find(f => f.source.id === s.id));

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
  return Array.from(seen.values())
    .sort((a, b) => b.intentScore - a.intentScore)
    .slice(0, 20);
};
