import { NextRequest, NextResponse } from 'next/server';

const SENIOR_TITLES = [
  'CTO', 'Chief Technology Officer',
  'VP Engineering', 'VP of Engineering',
  'Head of Engineering', 'Head of Technology',
  'Director of Engineering', 'Engineering Director',
  'Technical Lead', 'Tech Lead',
  'Co-Founder', 'Founder',
  'CEO', 'Chief Executive Officer',
  'Engineering Manager', 'Head of Product',
];

function inferDomain(companyName: string, sourceUrl: string): string | null {
  // Try to extract domain from the sourceUrl first
  if (sourceUrl) {
    try {
      const url = new URL(sourceUrl);
      // Skip generic job boards
      const skipDomains = ['linkedin.com', 'indeed.com', 'remotive.com', 'arbeitnow.com', 'g2.com', 'glassdoor.com', 'crunchbase.com'];
      if (!skipDomains.some(d => url.hostname.includes(d))) {
        return url.hostname.replace('www.', '');
      }
    } catch {}
  }

  // Fallback: construct likely domain from company name
  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '');

  return `${slug}.com`;
}

export async function POST(request: NextRequest) {
  try {
    const { company, sourceUrl, hunterKey } = await request.json();

    if (!hunterKey) {
      return NextResponse.json({ error: 'Hunter.io API key required' }, { status: 400 });
    }

    const domain = inferDomain(company, sourceUrl);
    if (!domain) {
      return NextResponse.json({ error: 'Could not determine company domain' }, { status: 400 });
    }

    // Call Hunter.io domain-search to get contacts at the company
    const hunterUrl = `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${hunterKey}&limit=10`;
    const res = await fetch(hunterUrl);
    const data = await res.json();

    if (!data?.data?.emails || data.data.emails.length === 0) {
      return NextResponse.json({ found: false, domain, message: 'No contacts found for this domain' });
    }

    const contacts = data.data.emails;

    // Score each contact by seniority
    const scored = contacts.map((contact: any) => {
      const title = (contact.position || '').toLowerCase();
      let score = 0;
      if (title.includes('cto') || title.includes('chief tech')) score += 100;
      else if (title.includes('vp') || title.includes('vice president')) score += 90;
      else if (title.includes('head of')) score += 80;
      else if (title.includes('director')) score += 70;
      else if (title.includes('founder') || title.includes('ceo')) score += 85;
      else if (title.includes('lead') || title.includes('manager')) score += 60;
      else score += 10;
      return { ...contact, seniorityScore: score };
    });

    scored.sort((a: any, b: any) => b.seniorityScore - a.seniorityScore);
    const best = scored[0];

    return NextResponse.json({
      found: true,
      domain,
      name: `${best.first_name || ''} ${best.last_name || ''}`.trim(),
      email: best.value,
      title: best.position || 'Contact',
      confidence: best.confidence,
      linkedin: best.linkedin || null,
    });

  } catch (error: any) {
    console.error('Hiring manager detection error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
