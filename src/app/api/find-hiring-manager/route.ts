import { NextRequest, NextResponse } from 'next/server';

// ── Known company → domain overrides (catches the most common misses) ──────
const KNOWN_DOMAINS: Record<string, string> = {
  'google': 'google.com', 'meta': 'meta.com', 'facebook': 'meta.com',
  'apple': 'apple.com', 'microsoft': 'microsoft.com', 'amazon': 'amazon.com',
  'netflix': 'netflix.com', 'stripe': 'stripe.com', 'shopify': 'shopify.com',
  'figma': 'figma.com', 'notion': 'notion.so', 'linear': 'linear.app',
  'vercel': 'vercel.com', 'supabase': 'supabase.com', 'twilio': 'twilio.com',
  'hubspot': 'hubspot.com', 'salesforce': 'salesforce.com', 'slack': 'slack.com',
  'zoom': 'zoom.us', 'dropbox': 'dropbox.com', 'atlassian': 'atlassian.com',
  'github': 'github.com', 'gitlab': 'gitlab.com', 'airbnb': 'airbnb.com',
  'uber': 'uber.com', 'lyft': 'lyft.com', 'coinbase': 'coinbase.com',
  'openai': 'openai.com', 'anthropic': 'anthropic.com', 'perplexity': 'perplexity.ai',
  'databricks': 'databricks.com', 'snowflake': 'snowflake.com', 'mongodb': 'mongodb.com',
  'hashicorp': 'hashicorp.com', 'cloudflare': 'cloudflare.com', 'fastly': 'fastly.com',
  'datadog': 'datadoghq.com', 'pagerduty': 'pagerduty.com', 'confluent': 'confluent.io',
  'rippling': 'rippling.com', 'deel': 'deel.com', 'gusto': 'gusto.com',
  'plaid': 'plaid.com', 'brex': 'brex.com', 'ramp': 'ramp.com',
  'airtable': 'airtable.com', 'asana': 'asana.com', 'monday': 'monday.com',
  'clickup': 'clickup.com', 'retool': 'retool.com', 'segment': 'segment.com',
  'mixpanel': 'mixpanel.com', 'amplitude': 'amplitude.com', 'heap': 'heap.io',
  'intercom': 'intercom.com', 'zendesk': 'zendesk.com', 'freshdesk': 'freshdesk.com',
  'pipedrive': 'pipedrive.com', 'close': 'close.com', 'apollo': 'apollo.io',
  'outreach': 'outreach.io', 'gong': 'gong.io', 'chorus': 'chorus.ai',
  'glean': 'glean.com', 'cohere': 'cohere.com', 'harvey': 'harvey.ai',
};

// ── TLDs to try in order ────────────────────────────────────────────────────
const TLD_FALLBACKS = ['.com', '.io', '.co', '.ai', '.tech', '.app', '.dev', '.net', '.org'];

// ── Clean a company name into a slug ────────────────────────────────────────
function toSlug(name: string): string {
  return name
    .toLowerCase()
    // Remove common suffixes that aren't part of the domain
    .replace(/\b(inc|llc|ltd|corp|co|company|group|technologies|technology|tech|solutions|services|agency|studios|studio)\b/g, '')
    // Remove special chars except spaces
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '');
}

// ── Extract domain from a LinkedIn company URL if present ───────────────────
function extractLinkedInCompanySlug(sourceUrl: string): string | null {
  try {
    const url = new URL(sourceUrl);
    if (url.hostname.includes('linkedin.com')) {
      // e.g. linkedin.com/company/stripe → "stripe"
      const match = url.pathname.match(/\/company\/([^/]+)/);
      if (match?.[1]) return match[1].toLowerCase().replace(/-/g, '');
    }
  } catch {}
  return null;
}

// ── Try Hunter.io for a specific domain ─────────────────────────────────────
async function tryHunterDomain(domain: string, hunterKey: string) {
  const url = `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${hunterKey}&limit=10`;
  const res = await fetch(url);

  if (res.status === 401) throw new Error('HUNTER_UNAUTHORIZED');
  if (res.status === 429) throw new Error('HUNTER_QUOTA');

  const data = await res.json();

  // Hunter quota/plan errors come back as 200 with an error key
  if (data?.errors?.[0]?.details?.includes('quota')) throw new Error('HUNTER_QUOTA');

  return data?.data?.emails?.length > 0 ? data.data : null;
}

// ── Score a contact by seniority ─────────────────────────────────────────────
function seniorityScore(title: string): number {
  const t = title.toLowerCase();
  if (t.includes('cto') || t.includes('chief tech') || t.includes('chief information')) return 100;
  if (t.includes('founder') || t.includes('co-founder')) return 95;
  if (t.includes('ceo') || t.includes('chief exec')) return 90;
  if (t.includes('vp') || t.includes('vice president')) return 85;
  if (t.includes('head of eng') || t.includes('head of tech') || t.includes('head of product')) return 80;
  if (t.includes('head of')) return 75;
  if (t.includes('director of eng') || t.includes('engineering director')) return 72;
  if (t.includes('director')) return 68;
  if (t.includes('principal') || t.includes('staff engineer')) return 60;
  if (t.includes('engineering manager') || t.includes('tech lead') || t.includes('technical lead')) return 55;
  if (t.includes('manager') || t.includes('lead')) return 45;
  return 10;
}

export async function POST(request: NextRequest) {
  try {
    const { company, sourceUrl, hunterKey } = await request.json();
    const serverHunterKey = hunterKey || process.env.HUNTER_API_KEY || 'b937eb0f532629a23bc002872195055922026f68';

    if (!serverHunterKey) {
      return NextResponse.json({ error: 'Hunter.io API key required' }, { status: 400 });
    }
    if (!company) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const slug = toSlug(company);

    // ── Step 1: Check known domains dictionary ────────────────────────────
    const knownDomain = KNOWN_DOMAINS[slug] || KNOWN_DOMAINS[company.toLowerCase().trim()];

    // ── Step 2: Try to extract real domain from sourceUrl ─────────────────
    let sourceDomain: string | null = null;
    if (sourceUrl) {
      try {
        const url = new URL(sourceUrl);
        const genericBoards = [
          'linkedin.com', 'indeed.com', 'remotive.com', 'arbeitnow.com',
          'g2.com', 'glassdoor.com', 'crunchbase.com', 'techcrunch.com',
          'himalayas.app', 'jobicy.com', 'themuse.com', 'findwork.dev',
          'hasjob.co', 'layoffs.fyi', 'jsearch.p.rapidapi.com', 'rapidapi.com',
        ];
        const isGeneric = genericBoards.some(d => url.hostname.includes(d));
        if (!isGeneric) {
          sourceDomain = url.hostname.replace('www.', '');
        }
      } catch {}
    }

    // ── Step 3: LinkedIn company slug → try as domain ─────────────────────
    const linkedInSlug = extractLinkedInCompanySlug(sourceUrl || '');

    // ── Build ordered list of domains to try ──────────────────────────────
    const domainsToTry: string[] = [];
    if (knownDomain) domainsToTry.push(knownDomain);
    if (sourceDomain) domainsToTry.push(sourceDomain);
    if (linkedInSlug) {
      domainsToTry.push(`${linkedInSlug}.com`);
      domainsToTry.push(`${linkedInSlug}.io`);
    }
    // TLD fallback chain on the cleaned company slug
    for (const tld of TLD_FALLBACKS) {
      const candidate = `${slug}${tld}`;
      if (!domainsToTry.includes(candidate)) domainsToTry.push(candidate);
    }

    // ── Try each domain until we get a hit ────────────────────────────────
    let found = false;
    let foundDomain = '';
    let contacts: any[] = [];

    for (const domain of domainsToTry) {
      try {
        const result = await tryHunterDomain(domain, hunterKey);
        if (result?.emails?.length > 0) {
          found = true;
          foundDomain = domain;
          contacts = result.emails;
          break;
        }
      } catch (err: any) {
        // Quota / auth errors — stop trying immediately
        if (err.message === 'HUNTER_QUOTA') {
          return NextResponse.json({
            found: false,
            domain: domainsToTry[0],
            message: 'Hunter.io monthly quota reached. Upgrade your Hunter plan or wait until next month.',
            errorCode: 'QUOTA_EXCEEDED',
          });
        }
        if (err.message === 'HUNTER_UNAUTHORIZED') {
          return NextResponse.json({
            found: false,
            domain: domainsToTry[0],
            message: 'Hunter.io API key is invalid. Check your key in Settings.',
            errorCode: 'INVALID_KEY',
          });
        }
        // Other errors (network etc) — continue to next domain
        continue;
      }
    }

    if (!found || contacts.length === 0) {
      return NextResponse.json({
        found: false,
        domain: foundDomain || `${slug}.com`,
        triedDomains: domainsToTry.slice(0, 5),
        message: `No contacts found for "${company}". Hunter.io may not have indexed this company yet, or it's too small/new.`,
      });
    }

    // ── Score and pick the best senior contact ────────────────────────────
    const scored = contacts
      .map((c: any) => ({ ...c, _score: seniorityScore(c.position || '') }))
      .sort((a: any, b: any) => b._score - a._score);

    const best = scored[0];

    return NextResponse.json({
      found: true,
      domain: foundDomain,
      name: `${best.first_name || ''} ${best.last_name || ''}`.trim() || 'Contact',
      email: best.value,
      title: best.position || 'Senior Contact',
      confidence: best.confidence,
      linkedin: best.linkedin || null,
      triedDomains: domainsToTry.slice(0, 5),
    });

  } catch (error: any) {
    console.error('Hiring manager detection error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
